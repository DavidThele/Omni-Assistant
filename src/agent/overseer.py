"""
Project Omni-Assistant - Overseer Orchestrator.
Root intelligence orchestrating sensory telemetry, memory retrieval,
dynamic prompt synthesis, and ephemeral sub-agent execution.
"""

import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from ..db.repository import TelemetryRepository
from ..logger import log_metric
from ..telemetry.token_governor import TokenGovernor
from ..telemetry.window_observer import WindowState
from .factory import EphemeralSubAgentFactory
from .subagent import SubAgentResult


@dataclass
class OverseerTurnResult:
    """Consolidated outcome of an Overseer orchestration cycle."""
    trigger_event: str
    active_app: str
    active_window: str
    subagent_id: str
    subagent_name: str
    subagent_mission: str
    subagent_tool_scope: List[str]
    subagent_result: SubAgentResult
    overseer_synthesis: str
    total_latency_ms: float
    tokens_consumed: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trigger_event": self.trigger_event,
            "active_app": self.active_app,
            "active_window": self.active_window,
            "subagent_id": self.subagent_id,
            "subagent_name": self.subagent_name,
            "subagent_mission": self.subagent_mission,
            "subagent_tool_scope": self.subagent_tool_scope,
            "subagent_result": self.subagent_result.to_dict(),
            "overseer_synthesis": self.overseer_synthesis,
            "total_latency_ms": round(self.total_latency_ms, 2),
            "tokens_consumed": self.tokens_consumed
        }


class OverseerOrchestrator:
    """
    Overseer Orchestrator coordinating local memory retrieval, dynamic prompt
    synthesis, and ephemeral sub-agent execution.
    """

    def __init__(
        self,
        repository: Optional[TelemetryRepository] = None,
        token_governor: Optional[TokenGovernor] = None
    ):
        self.repository = repository
        self.token_governor = token_governor or TokenGovernor()
        self.factory = EphemeralSubAgentFactory(token_governor=self.token_governor)

    def process_turn(
        self,
        window_state: Optional[WindowState] = None,
        user_query: Optional[str] = None,
        task_instruction: Optional[str] = None
    ) -> OverseerTurnResult:
        """
        Executes a complete Overseer orchestration cycle:
        1. Parse active telemetry context.
        2. Query local unified memory (RRF hybrid search).
        3. Dynamically synthesize prompt and spawn ephemeral sub-agent.
        4. Execute sub-agent under strict tool-scope isolation.
        5. Ephemerally dispose sub-agent to ensure zero memory leaks.
        6. Synthesize unified Overseer response.
        """
        start_time = time.perf_counter()

        app_name = window_state.app_name if window_state else "macOS Desktop"
        window_title = window_state.window_title if window_state else "Finder"
        ui_summary = ""
        if window_state and window_state.accessibility_tree:
            ui_summary = f"Role: {window_state.accessibility_tree.get('role', 'unknown')}"

        # 1. Retrieve relevant historical memory from local database if available
        retrieved_memory: List[Dict[str, Any]] = []
        if self.repository and (user_query or window_title):
            search_term = user_query or f"{app_name} {window_title}"
            try:
                # Perform hybrid RRF search
                rrf_results = self.repository.search_hybrid_rrf(search_term, top_k=3)
                retrieved_memory = [
                    {"content": r.content, "file_path": r.file_path, "score": r.rrf_score}
                    for r in rrf_results
                ]
            except Exception:
                # Fallback to recent logs if hybrid search encounters unindexed DB
                try:
                    recent = self.repository.get_recent_logs(limit=3)
                    retrieved_memory = [{"content": item.get("content", "")} for item in recent]
                except Exception:
                    retrieved_memory = []

        # 2. Ephemeral Sub-Agent Factory: Spawn dynamic sub-agent on demand
        agent = self.factory.spawn(
            app_name=app_name,
            window_title=window_title,
            accessibility_snippet=ui_summary,
            retrieved_memory=retrieved_memory,
            user_intent=user_query
        )

        subagent_id = agent.spec.agent_id
        subagent_name = agent.spec.name
        subagent_mission = agent.spec.mission
        subagent_tools = list(agent.spec.tool_scope)

        # 3. Execute sub-agent with designated task instruction
        instruction = task_instruction or user_query or f"Evaluate active context in {app_name}."
        sub_result = self.factory.execute_and_recycle(agent, instruction)

        # 4. Overseer high-level synthesis
        overseer_synthesis = (
            f"[Overseer]: Deployed ephemeral specialist '{subagent_name}'. "
            f"Result: {sub_result.response_text}"
        )

        total_latency = (time.perf_counter() - start_time) * 1000

        turn_result = OverseerTurnResult(
            trigger_event="user_request" if user_query else "telemetry_shift",
            active_app=app_name,
            active_window=window_title,
            subagent_id=subagent_id,
            subagent_name=subagent_name,
            subagent_mission=subagent_mission,
            subagent_tool_scope=subagent_tools,
            subagent_result=sub_result,
            overseer_synthesis=overseer_synthesis,
            total_latency_ms=total_latency,
            tokens_consumed=sub_result.tokens_consumed
        )

        log_metric(
            operation="overseer_orchestration_turn",
            latency_ms=total_latency,
            payload_size=len(overseer_synthesis),
            status="success",
            details={
                "subagent_name": subagent_name,
                "tools_granted": subagent_tools,
                "tokens": sub_result.tokens_consumed
            }
        )

        return turn_result
