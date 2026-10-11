"""
Project Omni-Assistant - Ephemeral Sub-Agent Factory.
Dynamically provisions task-specific sub-agents on demand without hardcoded agent types,
allocates scoped tools, and oversees their ephemeral lifecycle.
"""

import time
import uuid
from typing import Any, Callable, Dict, List, Optional

from ..logger import log_metric
from ..telemetry.token_governor import TokenGovernor
from .prompt_synthesizer import PromptSynthesizer, SynthesizedPrompt
from .subagent import EphemeralSubAgent, SubAgentResult, SubAgentSpec, SubAgentState


class EphemeralSubAgentFactory:
    """
    Factory for instantiating, managing, and recycling ephemeral sub-agents.
    Ensures sub-agents exist only for the duration of their scoped mission.
    """

    def __init__(
        self,
        token_governor: Optional[TokenGovernor] = None,
        default_tool_handlers: Optional[Dict[str, Callable[..., Any]]] = None
    ):
        self.token_governor = token_governor
        self.prompt_synthesizer = PromptSynthesizer(token_governor=token_governor)
        self.default_tool_handlers = default_tool_handlers or {}
        self.active_agents: Dict[str, EphemeralSubAgent] = {}
        self.lifecycle_history: List[Dict[str, Any]] = []

    def register_tool_handler(self, tool_name: str, handler: Callable[..., Any]) -> None:
        """Registers a global native tool implementation."""
        self.default_tool_handlers[tool_name] = handler

    def spawn(
        self,
        app_name: str,
        window_title: str,
        accessibility_snippet: Optional[str] = None,
        retrieved_memory: Optional[List[Dict[str, Any]]] = None,
        user_intent: Optional[str] = None,
        custom_tool_handlers: Optional[Dict[str, Callable[..., Any]]] = None
    ) -> EphemeralSubAgent:
        """
        Dynamically synthesizes a prompt and provisions an ephemeral sub-agent.
        """
        start = time.perf_counter()

        # 1. Synthesize dynamic prompt, mission, and tool scope
        synthesized: SynthesizedPrompt = self.prompt_synthesizer.synthesize(
            app_name=app_name,
            window_title=window_title,
            accessibility_snippet=accessibility_snippet,
            retrieved_memory=retrieved_memory,
            user_intent=user_intent
        )

        agent_id = f"subagent_{uuid.uuid4().hex[:8]}"

        # 2. Construct SubAgentSpec
        spec = SubAgentSpec(
            agent_id=agent_id,
            name=synthesized.agent_name,
            mission=synthesized.mission,
            system_prompt=synthesized.system_prompt,
            tool_scope=synthesized.suggested_tool_scope,
            context_data={
                "detected_domain": synthesized.detected_domain,
                "context_summary": synthesized.context_summary,
                "context_tokens": synthesized.context_tokens
            }
        )

        # 3. Assemble tool handlers strictly matching allocated scope
        merged_handlers = dict(self.default_tool_handlers)
        if custom_tool_handlers:
            merged_handlers.update(custom_tool_handlers)

        # 4. Instantiate EphemeralSubAgent
        agent = EphemeralSubAgent(
            spec=spec,
            tool_handlers=merged_handlers,
            token_governor=self.token_governor
        )

        self.active_agents[agent_id] = agent
        latency_ms = (time.perf_counter() - start) * 1000

        self.lifecycle_history.append({
            "timestamp": time.time(),
            "event": "spawned",
            "agent_id": agent_id,
            "name": spec.name,
            "tool_scope": spec.tool_scope
        })

        log_metric(
            operation="subagent_spawn",
            latency_ms=latency_ms,
            payload_size=len(spec.system_prompt),
            status="success",
            details={
                "agent_id": agent_id,
                "name": spec.name,
                "tool_scope": spec.tool_scope,
                "active_count": len(self.active_agents)
            }
        )

        return agent

    def execute_and_recycle(
        self,
        agent: EphemeralSubAgent,
        task_instruction: str
    ) -> SubAgentResult:
        """
        Executes the sub-agent on its mission, then immediately disposes it
        to guarantee ephemeral lifecycle termination.
        """
        result = agent.execute(task_instruction)
        agent_id = agent.spec.agent_id

        # Ephemeral disposal
        self.dispose(agent_id)
        return result

    def dispose(self, agent_id: str) -> bool:
        """Disposes an active ephemeral sub-agent and removes it from memory."""
        agent = self.active_agents.pop(agent_id, None)
        if agent:
            agent.dispose()
            self.lifecycle_history.append({
                "timestamp": time.time(),
                "event": "disposed",
                "agent_id": agent_id,
                "name": agent.spec.name
            })
            return True
        return False

    def dispose_all(self) -> int:
        """Disposes all currently active ephemeral sub-agents."""
        count = len(self.active_agents)
        for agent_id in list(self.active_agents.keys()):
            self.dispose(agent_id)
        return count

    def get_active_count(self) -> int:
        return len(self.active_agents)

    def list_active(self) -> List[Dict[str, Any]]:
        return [
            {
                "agent_id": agent.spec.agent_id,
                "name": agent.spec.name,
                "mission": agent.spec.mission,
                "state": agent.state.value,
                "tool_scope": agent.spec.tool_scope,
                "created_at": agent.spec.created_at
            }
            for agent in self.active_agents.values()
        ]
