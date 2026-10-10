"""
Project Omni-Assistant - Voice Activity Detection (VAD) Engine.
Analyzes 16kHz 16-bit linear PCM microphone streams in real-time.
Implements root-mean-square (RMS) energy tracking, dynamic noise floor estimation,
and state machine for speech onset / end-of-speech detection.
"""

import enum
import math
import struct
import time
from dataclasses import dataclass
from typing import Callable, List, Optional

from ..logger import log_metric


class VADState(str, enum.Enum):
    SILENCE = "SILENCE"
    SPEECH_DETECTED = "SPEECH_DETECTED"
    SPEAKING = "SPEAKING"
    SPEECH_ENDED = "SPEECH_ENDED"


class VADEvent(str, enum.Enum):
    SILENCE = "silence"
    SPEECH_START = "speech_start"
    SPEECH_CHUNK = "speech_chunk"
    SPEECH_END = "speech_end"


@dataclass
class VADFrameResult:
    state: VADState
    event: VADEvent
    rms_energy: float
    is_speech: bool
    frame_duration_ms: float
    confidence: float


class VoiceActivityDetector:
    """
    Frame-based Voice Activity Detector optimized for 16kHz 16-bit PCM mono audio.
    Frame size defaults to 20ms (320 samples / 640 bytes).
    """

    def __init__(
        self,
        sample_rate: int = 16000,
        frame_duration_ms: float = 20.0,
        energy_threshold: float = 450.0,
        min_speech_frames: int = 2,
        silence_timeout_sec: float = 0.6,
        on_speech_start: Optional[Callable[[], None]] = None,
        on_speech_end: Optional[Callable[[], None]] = None
    ):
        self.sample_rate = sample_rate
        self.frame_duration_ms = frame_duration_ms
        self.bytes_per_sample = 2  # 16-bit
        self.samples_per_frame = int(sample_rate * (frame_duration_ms / 1000.0))
        self.frame_bytes = self.samples_per_frame * self.bytes_per_sample

        self.energy_threshold = energy_threshold
        self.min_speech_frames = min_speech_frames
        self.silence_timeout_sec = silence_timeout_sec

        self.on_speech_start = on_speech_start
        self.on_speech_end = on_speech_end

        # State tracking
        self.state = VADState.SILENCE
        self.consecutive_speech_frames = 0
        self.consecutive_silence_frames = 0
        self.silence_start_time: Optional[float] = None
        self.speech_start_time: Optional[float] = None

        # Diagnostic counters
        self.total_frames_processed = 0
        self.total_speech_frames = 0

    def compute_rms(self, pcm_frame: bytes) -> float:
        """Calculates Root Mean Square (RMS) energy for 16-bit PCM samples."""
        num_samples = len(pcm_frame) // self.bytes_per_sample
        if num_samples == 0:
            return 0.0

        try:
            samples = struct.unpack(f"<{num_samples}h", pcm_frame[:num_samples * 2])
            sum_squares = sum(s * s for s in samples)
            return math.sqrt(sum_squares / num_samples)
        except Exception:
            return 0.0

    def process_frame(self, pcm_frame: bytes) -> VADFrameResult:
        """
        Processes a single PCM audio frame and updates VAD state machine.
        """
        now = time.perf_counter()
        rms = self.compute_rms(pcm_frame)
        is_above_threshold = rms >= self.energy_threshold
        self.total_frames_processed += 1

        prev_state = self.state
        event = VADEvent.SILENCE
        confidence = min(1.0, rms / max(1.0, self.energy_threshold * 2.0))

        if is_above_threshold:
            self.total_speech_frames += 1
            self.consecutive_speech_frames += 1
            self.consecutive_silence_frames = 0
            self.silence_start_time = None

            if self.state in (VADState.SILENCE, VADState.SPEECH_DETECTED):
                if self.consecutive_speech_frames >= self.min_speech_frames:
                    self.state = VADState.SPEAKING
                    self.speech_start_time = now
                    event = VADEvent.SPEECH_START
                    if self.on_speech_start:
                        self.on_speech_start()
                else:
                    self.state = VADState.SPEECH_DETECTED
                    event = VADEvent.SILENCE
            elif self.state == VADState.SPEAKING:
                event = VADEvent.SPEECH_CHUNK

        else:
            # Below energy threshold (silence or background noise)
            self.consecutive_speech_frames = 0
            self.consecutive_silence_frames += 1

            if self.state in (VADState.SPEAKING, VADState.SPEECH_DETECTED):
                if self.silence_start_time is None:
                    self.silence_start_time = now

                silence_duration = now - self.silence_start_time
                if silence_duration >= self.silence_timeout_sec:
                    self.state = VADState.SILENCE
                    event = VADEvent.SPEECH_END
                    self.silence_start_time = None
                    self.speech_start_time = None
                    if self.on_speech_end:
                        self.on_speech_end()
                else:
                    # Still within grace period of speech pause
                    event = VADEvent.SPEECH_CHUNK
            else:
                self.state = VADState.SILENCE
                event = VADEvent.SILENCE

        return VADFrameResult(
            state=self.state,
            event=event,
            rms_energy=rms,
            is_speech=self.state == VADState.SPEAKING,
            frame_duration_ms=self.frame_duration_ms,
            confidence=round(confidence, 3)
        )

    def process_stream(self, pcm_bytes: bytes) -> List[VADFrameResult]:
        """Slices a PCM byte buffer into frames and processes them sequentially."""
        results = []
        for i in range(0, len(pcm_bytes), self.frame_bytes):
            chunk = pcm_bytes[i:i + self.frame_bytes]
            if len(chunk) == self.frame_bytes:
                results.append(self.process_frame(chunk))
        return results

    def reset(self) -> None:
        """Resets the detector state."""
        self.state = VADState.SILENCE
        self.consecutive_speech_frames = 0
        self.consecutive_silence_frames = 0
        self.silence_start_time = None
        self.speech_start_time = None
