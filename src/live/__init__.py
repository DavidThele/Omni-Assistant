"""
Gemini Live API Integration Package for Project Omni-Assistant.
Provides low-latency bidirectional streaming using the official Python google-genai SDK,
Voice Activity Detection (VAD), and instantaneous barge-in interruption.
"""

from .gemini_live import (
    GeminiLiveClient,
    LiveSessionConfig,
    LiveResponse,
    HAS_GOOGLE_GENAI
)
from .vad import (
    VoiceActivityDetector,
    VADState,
    VADEvent,
    VADFrameResult
)
from .audio_router import (
    CancellableAudioPlayer,
    play_audio_locally,
    pcm_to_wav,
    generate_synthetic_pcm_speech,
    generate_pcm_silence
)
from .barge_in import (
    BargeInController,
    BargeInEventReport
)

__all__ = [
    "GeminiLiveClient",
    "LiveSessionConfig",
    "LiveResponse",
    "HAS_GOOGLE_GENAI",
    "VoiceActivityDetector",
    "VADState",
    "VADEvent",
    "VADFrameResult",
    "CancellableAudioPlayer",
    "play_audio_locally",
    "pcm_to_wav",
    "generate_synthetic_pcm_speech",
    "generate_pcm_silence",
    "BargeInController",
    "BargeInEventReport"
]
