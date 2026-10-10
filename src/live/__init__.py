"""
Gemini Live API Integration Package for Project Omni-Assistant.
Provides low-latency bidirectional streaming using the official Python google-genai SDK.
"""

from .gemini_live import (
    GeminiLiveClient,
    LiveSessionConfig,
    LiveResponse
)

__all__ = [
    "GeminiLiveClient",
    "LiveSessionConfig",
    "LiveResponse"
]
