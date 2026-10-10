"""
Project Omni-Assistant - Barge-In Interruption Controller.
Monitors user speech stream while assistant is responding, triggers sub-50ms playback
cutoff when voice activity is detected, and synchronizes cancellation with Gemini Live API.
"""

import time
from dataclasses import dataclass
from typing import Callable, Optional

from ..logger import log_metric
from .audio_router import CancellableAudioPlayer
from .vad import VADEvent, VADFrameResult, VoiceActivityDetector


@dataclass
class BargeInEventReport:
    """Detailed telemetry record for a barge-in interruption incident."""
    interrupted: bool
    trigger_event: VADEvent
    interruption_latency_ms: float
    user_rms_energy: float
    assistant_was_playing: bool
    playback_duration_before_cut_sec: float


class BargeInController:
    """
    Orchestrates duplex voice interaction:
    1. Tracks assistant speaking state.
    2. Runs user mic audio frames through VoiceActivityDetector.
    3. If user speaks while assistant is talking, triggers instant audio cutoff.
    4. Notifies Gemini Live API session to cancel active generation.
    """

    def __init__(
        self,
        audio_player: Optional[CancellableAudioPlayer] = None,
        vad: Optional[VoiceActivityDetector] = None,
        on_barge_in: Optional[Callable[[BargeInEventReport], None]] = None
    ):
        self.audio_player = audio_player or CancellableAudioPlayer()
        self.vad = vad or VoiceActivityDetector()
        self.on_barge_in = on_barge_in

        self._assistant_speaking = False
        self._speech_start_playback_time: Optional[float] = None
        self._last_barge_in: Optional[BargeInEventReport] = None

    @property
    def is_assistant_speaking(self) -> bool:
        return self._assistant_speaking or self.audio_player.is_playing

    def start_assistant_turn(self, pcm_bytes: bytes, sample_rate: int = 24000) -> None:
        """Called when assistant begins streaming audio out to the user."""
        self._assistant_speaking = True
        self._speech_start_playback_time = time.perf_counter()
        self.audio_player.play(pcm_bytes, sample_rate=sample_rate, blocking=False)

    def complete_assistant_turn(self) -> None:
        """Called when assistant finishes playing its response."""
        self._assistant_speaking = False
        self._speech_start_playback_time = None

    def process_user_audio_frame(self, pcm_frame: bytes) -> VADFrameResult:
        """
        Feeds a 16kHz PCM frame from user microphone.
        If speech onset is detected while assistant is speaking, triggers instant barge-in.
        """
        frame_result = self.vad.process_frame(pcm_frame)

        # Barge-In Condition: Speech onset detected while assistant is actively speaking
        if frame_result.event == VADEvent.SPEECH_START and self.is_assistant_speaking:
            self._trigger_barge_in(frame_result)

        return frame_result

    def _trigger_barge_in(self, frame_result: VADFrameResult) -> BargeInEventReport:
        """Executes emergency interruption sequence."""
        t0 = time.perf_counter()

        # 1. Instantly stop audio player
        cutoff_latency_ms = self.audio_player.stop()

        elapsed_playback_sec = 0.0
        if self._speech_start_playback_time:
            elapsed_playback_sec = time.perf_counter() - self._speech_start_playback_time

        self._assistant_speaking = False
        self._speech_start_playback_time = None

        total_latency_ms = (time.perf_counter() - t0) * 1000 + cutoff_latency_ms

        report = BargeInEventReport(
            interrupted=True,
            trigger_event=frame_result.event,
            interruption_latency_ms=round(total_latency_ms, 2),
            user_rms_energy=round(frame_result.rms_energy, 1),
            assistant_was_playing=True,
            playback_duration_before_cut_sec=round(elapsed_playback_sec, 3)
        )
        self._last_barge_in = report

        # 2. Log structured metric
        log_metric(
            operation="barge_in_interruption",
            latency_ms=total_latency_ms,
            status="success",
            details={
                "rms_energy": report.user_rms_energy,
                "cutoff_latency_ms": round(cutoff_latency_ms, 2),
                "playback_cut_at_sec": report.playback_duration_before_cut_sec
            }
        )

        # 3. Trigger callback for WebSocket cancellation
        if self.on_barge_in:
            self.on_barge_in(report)

        return report

    def get_last_barge_in(self) -> Optional[BargeInEventReport]:
        return self._last_barge_in
