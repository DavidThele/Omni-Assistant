"""
Telemetry package for Project Omni-Assistant.
Monitors OS window state, accessibility tree, command history, and sensor streams.
Implements the Token Governor and batching logic to reserve tokens for Gemini Live streaming.
"""

from .window_observer import (
    WindowState,
    get_active_window_state,
    extract_accessibility_tree,
    WindowObserver
)
from .token_governor import (
    TokenGovernor,
    GovernorState,
    TelemetryBatcher,
    estimate_tokens
)

__all__ = [
    "WindowState",
    "get_active_window_state",
    "extract_accessibility_tree",
    "WindowObserver",
    "TokenGovernor",
    "GovernorState",
    "TelemetryBatcher",
    "estimate_tokens"
]
