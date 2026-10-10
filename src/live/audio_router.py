"""
Project Omni-Assistant - Audio Router & Local Playback Engine.
Handles 16kHz PCM microphone capture, 24kHz PCM audio playback, WAV serialization,
and native macOS audio playback via afplay with instant cancellation support for barge-in.
"""

import math
import os
import shutil
import struct
import subprocess
import sys
import threading
import time
import wave
from pathlib import Path
from typing import Optional, Tuple, Union

from ..logger import log_metric

IS_MACOS = sys.platform == "darwin"


def pcm_to_wav(
    pcm_bytes: bytes,
    wav_path: Union[str, Path],
    sample_rate: int = 24000,
    channels: int = 1,
    sample_width: int = 2
) -> str:
    """Encodes raw 16-bit linear PCM bytes into standard RIFF WAV format."""
    path_str = str(wav_path)
    with wave.open(path_str, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm_bytes)
    return path_str


def generate_synthetic_pcm_speech(
    duration_sec: float = 2.0,
    sample_rate: int = 16000,
    base_freq: float = 220.0
) -> bytes:
    """
    Generates synthetic 16-bit linear PCM audio wave for testing
    voice streaming pipelines when a hardware microphone is unavailable.
    """
    num_samples = int(duration_sec * sample_rate)
    frames = []
    for i in range(num_samples):
        t = float(i) / sample_rate
        val = (
            0.5 * math.sin(2.0 * math.pi * base_freq * t) +
            0.3 * math.sin(2.0 * math.pi * (base_freq * 2.0) * t) +
            0.2 * math.sin(2.0 * math.pi * (base_freq * 3.0) * t)
        )
        sample = int(32767.0 * 0.4 * val)
        frames.append(struct.pack("<h", max(-32768, min(32767, sample))))
    return b"".join(frames)


def generate_pcm_silence(duration_sec: float = 0.5, sample_rate: int = 16000) -> bytes:
    """Generates pure digital silence (zeroes) in 16-bit PCM mono."""
    num_samples = int(duration_sec * sample_rate)
    return b"\x00\x00" * num_samples


class CancellableAudioPlayer:
    """
    Manages active audio playback on macOS/Linux with millisecond-grade instant cancellation.
    Critical for low-latency Voice Barge-in interruption.
    """

    def __init__(self, output_dir: Optional[Path] = None):
        self.base_dir = output_dir or (Path(__file__).resolve().parent.parent.parent / "logs")
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.wav_path = self.base_dir / "latest_gemini_response.wav"

        self._active_proc: Optional[subprocess.Popen] = None
        self._simulated_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._is_playing = False
        self._lock = threading.Lock()
        self._playback_start_time: float = 0.0

    @property
    def is_playing(self) -> bool:
        with self._lock:
            if self._active_proc is not None:
                if self._active_proc.poll() is None:
                    return True
                self._is_playing = False
                self._active_proc = None
            return self._is_playing

    def play(
        self,
        pcm_bytes: bytes,
        sample_rate: int = 24000,
        blocking: bool = False
    ) -> bool:
        """
        Starts audio playback asynchronously.
        On macOS: launches /usr/bin/afplay subprocess.
        On Linux: launches aplay subprocess if available.
        Otherwise: simulates timed audio buffer consumption in a daemon thread.
        """
        if not pcm_bytes:
            return False

        # Stop any ongoing playback first
        self.stop()

        pcm_to_wav(pcm_bytes, str(self.wav_path), sample_rate=sample_rate)
        duration_sec = len(pcm_bytes) / float(sample_rate * 2)

        with self._lock:
            self._playback_start_time = time.perf_counter()
            self._stop_event.clear()

            if IS_MACOS and shutil.which("afplay"):
                try:
                    self._active_proc = subprocess.Popen(
                        ["afplay", str(self.wav_path)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                    self._is_playing = True
                except Exception:
                    self._is_playing = False
            elif shutil.which("aplay"):
                try:
                    self._active_proc = subprocess.Popen(
                        ["aplay", str(self.wav_path)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                    self._is_playing = True
                except Exception:
                    self._is_playing = False
            else:
                # Simulated playback thread for environments without audio card
                self._is_playing = True

                def _sim_worker():
                    end_time = time.perf_counter() + duration_sec
                    while time.perf_counter() < end_time:
                        if self._stop_event.is_set():
                            break
                        time.sleep(0.01)
                    with self._lock:
                        self._is_playing = False

                self._simulated_thread = threading.Thread(target=_sim_worker, daemon=True)
                self._simulated_thread.start()

        if blocking:
            if self._active_proc is not None:
                self._active_proc.wait()
            elif self._simulated_thread is not None:
                self._simulated_thread.join()

        return True

    def stop(self) -> float:
        """
        Immediately halts active audio playback (Barge-in).
        Returns the interruption latency in milliseconds.
        """
        t0 = time.perf_counter()
        with self._lock:
            self._stop_event.set()
            if self._active_proc is not None:
                try:
                    self._active_proc.terminate()
                    self._active_proc.wait(timeout=0.1)
                except Exception:
                    try:
                        self._active_proc.kill()
                    except Exception:
                        pass
                self._active_proc = None
            self._is_playing = False

        interruption_latency_ms = (time.perf_counter() - t0) * 1000
        return interruption_latency_ms


def play_audio_locally(
    pcm_bytes: bytes,
    sample_rate: int = 24000,
    output_dir: Optional[Path] = None
) -> Tuple[bool, str]:
    """Synchronous helper for full audio playback."""
    player = CancellableAudioPlayer(output_dir)
    ok = player.play(pcm_bytes, sample_rate=sample_rate, blocking=True)
    duration_sec = len(pcm_bytes) / float(sample_rate * 2) if pcm_bytes else 0.0
    return ok, f"Audio converted to WAV and played ({len(pcm_bytes)} bytes, {duration_sec:.2f}s)"
