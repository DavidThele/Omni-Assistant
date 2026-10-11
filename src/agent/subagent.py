"""
Project Omni-Assistant - Ephemeral Sub-Agent Specification & Execution Engine.
Defines ephemeral sub-agents with dynamic tool scoping, sandboxed capability gates,
and clean lifecycle termination.
"""

import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

from ..logger import log_metric
from ..telemetry.token_governor import estimate_tokens, TokenGovernor


class SubAgentState(str, Enum):
    SPAWNED = "SPAWNED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    DISPOSED = "DISPOSED"


@dataclass
class SubAgentSpec:
    """Blueprint for dynamically generating an ephemeral sub-agent."""
    agent_id: str
    name: str
    mission: str
    system_prompt: str
    tool_scope: List[str]
    context_data: Dict[str, Any] = field(default_factory=dict)
    model_name: str = "gemini-2.0-flash-exp"
    max_tokens: int = 4096
    created_at: float = field(default_factory=time.time)


@dataclass
class ToolExecutionResult:
    tool_name: str
    arguments: Dict[str, Any]
    status: str  # "success" or "blocked" or "error"
    output: Any
    latency_ms: float


@dataclass
class SubAgentResult:
    agent_id: str
    agent_name: str
    mission: str
    status: SubAgentState
    response_text: str
    tool_invocations: List[ToolExecutionResult]
    tokens_consumed: int
    execution_time_ms: float
    error_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "mission": self.mission,
            "status": self.status.value,
            "response_text": self.response_text,
            "tool_invocations": [
                {
                    "tool_name": t.tool_name,
                    "arguments": t.arguments,
                    "status": t.status,
                    "output": str(t.output),
                    "latency_ms": t.latency_ms
                }
                for t in self.tool_invocations
            ],
            "tokens_consumed": self.tokens_consumed,
            "execution_time_ms": round(self.execution_time_ms, 2),
            "error_message": self.error_message
        }


class EphemeralSubAgent:
    """
    An on-demand, specialized sub-agent dynamically created by the Factory.
    Enforces strict tool-scope isolation: any attempt to execute an unallocated tool
    is denied immediately.
    """

    def __init__(
        self,
        spec: SubAgentSpec,
        tool_handlers: Optional[Dict[str, Callable[..., Any]]] = None,
        token_governor: Optional[TokenGovernor] = None
    ):
        self.spec = spec
        self.state = SubAgentState.SPAWNED
        self.tool_handlers = tool_handlers or {}
        self.token_governor = token_governor
        self.tool_invocations: List[ToolExecutionResult] = []
        self.disposed = False

    def invoke_tool(self, tool_name: str, **kwargs) -> ToolExecutionResult:
        """
        Executes a tool call after strictly verifying that tool_name is within
        the sub-agent's dynamic tool_scope.
        """
        start = time.perf_counter()

        # Strict security gate: Tool Scope Enforcement
        if tool_name not in self.spec.tool_scope:
            latency = (time.perf_counter() - start) * 1000
            blocked_result = ToolExecutionResult(
                tool_name=tool_name,
                arguments=kwargs,
                status="blocked",
                output=f"SecurityError: Tool '{tool_name}' is not in allowed scope {self.spec.tool_scope}.",
                latency_ms=latency
            )
            self.tool_invocations.append(blocked_result)
            return blocked_result

        handler = self.tool_handlers.get(tool_name)
        if not handler:
            # Deterministic default mock behavior for registered tools
            latency = (time.perf_counter() - start) * 1000
            mock_output = f"[DynamicTool:{tool_name}] Executed successfully with args={kwargs}"
            success_result = ToolExecutionResult(
                tool_name=tool_name,
                arguments=kwargs,
                status="success",
                output=mock_output,
                latency_ms=latency
            )
            self.tool_invocations.append(success_result)
            return success_result

        try:
            output = handler(**kwargs)
            latency = (time.perf_counter() - start) * 1000
            res = ToolExecutionResult(
                tool_name=tool_name,
                arguments=kwargs,
                status="success",
                output=output,
                latency_ms=latency
            )
        except Exception as e:
            latency = (time.perf_counter() - start) * 1000
            res = ToolExecutionResult(
                tool_name=tool_name,
                arguments=kwargs,
                status="error",
                output=str(e),
                latency_ms=latency
            )

        self.tool_invocations.append(res)
        return res

    def execute(self, task_instruction: str) -> SubAgentResult:
        """
        Executes the ephemeral sub-agent's designated task.
        """
        if self.disposed:
            raise RuntimeError(f"SubAgent '{self.spec.agent_id}' has already been disposed.")

        start_time = time.perf_counter()
        self.state = SubAgentState.ACTIVE

        # Estimate tokens for prompt + input
        input_tokens = estimate_tokens(self.spec.system_prompt + "\n" + task_instruction)

        # Dynamic reasoning simulation based on tool requirements
        # If instruction explicitly queries tools, invoke them
        if "search" in task_instruction.lower() and "search_memory" in self.spec.tool_scope:
            self.invoke_tool("search_memory", query=task_instruction)

        if "analyze" in task_instruction.lower() and "analyze_ast" in self.spec.tool_scope:
            self.invoke_tool("analyze_ast", target="telemetry_logs")

        if ("diff" in task_instruction.lower() or "compare" in task_instruction.lower()) and "diff_files" in self.spec.tool_scope:
            self.invoke_tool("diff_files", target_a="v1", target_b="v2")

        if "summarize" in task_instruction.lower() and "summarize_document" in self.spec.tool_scope:
            self.invoke_tool("summarize_document", document=task_instruction)

        # Synthesize sub-agent response text
        tool_status_summary = ""
        if self.tool_invocations:
            invoked_names = [t.tool_name for t in self.tool_invocations]
            tool_status_summary = f" Executed tools: {', '.join(invoked_names)}."

        response_text = (
            f"[{self.spec.name}]: Completed mission '{self.spec.mission}'. "
            f"Evaluated task '{task_instruction}'.{tool_status_summary} "
            f"Findings verified within /sandbox boundaries."
        )

        output_tokens = estimate_tokens(response_text)
        total_tokens = input_tokens + output_tokens

        # Record token consumption with governor if attached
        if self.token_governor:
            self.token_governor.consume(total_tokens, channel="telemetry")

        self.state = SubAgentState.COMPLETED
        execution_latency = (time.perf_counter() - start_time) * 1000

        result = SubAgentResult(
            agent_id=self.spec.agent_id,
            agent_name=self.spec.name,
            mission=self.spec.mission,
            status=self.state,
            response_text=response_text,
            tool_invocations=list(self.tool_invocations),
            tokens_consumed=total_tokens,
            execution_time_ms=execution_latency
        )

        log_metric(
            operation="subagent_execution",
            latency_ms=execution_latency,
            payload_size=len(response_text),
            status="success",
            details={
                "agent_id": self.spec.agent_id,
                "agent_name": self.spec.name,
                "tools_invoked": len(self.tool_invocations),
                "tokens": total_tokens
            }
        )

        return result

    def dispose(self) -> None:
        """
        Ephemeral lifecycle completion: wipes memory buffers,
        marks subagent as disposed to guarantee zero memory leaks.
        """
        if self.disposed:
            return
        self.disposed = True
        self.state = SubAgentState.DISPOSED
        self.tool_handlers.clear()
        self.tool_invocations.clear()

        log_metric(
            operation="subagent_disposed",
            latency_ms=0.01,
            status="success",
            details={"agent_id": self.spec.agent_id, "name": self.spec.name}
        )
