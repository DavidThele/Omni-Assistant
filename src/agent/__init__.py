"""
Project Omni-Assistant - Agent Orchestration Package.
Provides dynamic prompt synthesis, ephemeral sub-agent provisioning,
tool scoping, and Overseer orchestration.
"""

from .prompt_synthesizer import PromptSynthesizer, SynthesizedPrompt, TOOL_CATALOG
from .subagent import (
    EphemeralSubAgent,
    SubAgentSpec,
    SubAgentState,
    SubAgentResult,
    ToolExecutionResult
)
from .factory import EphemeralSubAgentFactory
from .overseer import OverseerOrchestrator, OverseerTurnResult

__all__ = [
    "PromptSynthesizer",
    "SynthesizedPrompt",
    "TOOL_CATALOG",
    "EphemeralSubAgent",
    "SubAgentSpec",
    "SubAgentState",
    "SubAgentResult",
    "ToolExecutionResult",
    "EphemeralSubAgentFactory",
    "OverseerOrchestrator",
    "OverseerTurnResult"
]
