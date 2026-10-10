"""
Telemetry package for Project Omni-Assistant.
Monitors OS window state, accessibility tree, command history, and sensor streams.
"""

from .window_observer import (
    WindowState,
    get_active_window_state,
    extract_accessibility_tree,
    WindowObserver
)

__all__ = [
    "WindowState",
    "get_active_window_state",
    "extract_accessibility_tree",
    "WindowObserver"
]
