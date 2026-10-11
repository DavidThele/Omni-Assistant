#!/usr/bin/env python3
"""
Test Step 3.2: Bidirectional audio streaming with Voice Activity Detection (VAD) and barge-in.
Specification:
- Establish Gemini Live WebSocket session with AUDIO modalities.
- Stream 16kHz linear PCM audio chunks over WebSocket and receive 24kHz audio response packets.
- Test Voice Activity Detection (VAD) engine (RMS energy tracking, speech onset, end-of-speech).
- Test Voice Barge-In interruption: verify instant (<50ms) audio playback cutoff when user speaks.
- Serialize received audio to WAV format.
- Visual validation output and metric verification in telemetry_metrics.jsonl.
"""

import asyncio
import os
import sys
import time
import wave
from pathlib import Path
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from src.logger import install_loud_and_brittle_failsafe, METRICS_LOG_PATH
from src.live import (
    GeminiLiveClient,
    LiveSessionConfig,
    VoiceActivityDetector,
    VADState,
    VADEvent,
    CancellableAudioPlayer,
    BargeInController,
    generate_synthetic_pcm_speech,
    generate_pcm_silence,
    pcm_to_wav,
    HAS_GOOGLE_GENAI
)


def print_banner(text: str):
    line = "=" * 70
    print(f"\n{line}")
    print(f"  {text}")
    print(f"{line}\n")


def print_section(title: str):
    print(f"\n--- {title} ---")


async def run_async_test():
    install_loud_and_brittle_failsafe()
    print_banner("PROJECT OMNI-ASSISTANT: TEST STEP 3.2 (VAD, AUDIO STREAMING & BARGE-IN)")

    api_key_present = bool(os.environ.get("GEMINI_API_KEY"))
    print("Environment Verification:")
    print(f"  [✓] Platform:                     {sys.platform}")
    print(f"  [✓] GEMINI_API_KEY detected:      {'YES' if api_key_present else 'NO'}")
    print(f"  [✓] Python google-genai SDK:      {'AVAILABLE' if HAS_GOOGLE_GENAI else 'PENDING LOCAL PIP INSTALL'}")
    print(f"  [✓] Target Audio Input Format:    16kHz 16-bit Linear PCM Mono")
    print(f"  [✓] Target Audio Output Format:   24kHz 16-bit Linear PCM Mono")

    # =========================================================================
    # Part 1: Voice Activity Detection (VAD) State Machine Validation
    # =========================================================================
    print_section("1. Testing Voice Activity Detection (VAD) Engine")

    speech_started_events = []
    speech_ended_events = []

    vad = VoiceActivityDetector(
        sample_rate=16000,
        frame_duration_ms=20.0,
        energy_threshold=400.0,
        min_speech_frames=2,
        silence_timeout_sec=0.2,
        on_speech_start=lambda: speech_started_events.append(time.perf_counter()),
        on_speech_end=lambda: speech_ended_events.append(time.perf_counter())
    )

    # Frame 1 & 2: Digital Silence
    silence_frame = generate_pcm_silence(duration_sec=0.02, sample_rate=16000)
    res_silence = vad.process_frame(silence_frame)
    print(f"  [+] Feeding Silence Frame:  RMS={res_silence.rms_energy:.1f} | State={res_silence.state} | Event={res_silence.event}")
    assert res_silence.state == VADState.SILENCE, f"Expected SILENCE, got {res_silence.state}"

    # Frame 3 & 4: Voice Speech Frame (220Hz synthetic speech)
    speech_frame = generate_synthetic_pcm_speech(duration_sec=0.02, sample_rate=16000, base_freq=220.0)
    res_speech_1 = vad.process_frame(speech_frame)
    res_speech_2 = vad.process_frame(speech_frame)
    print(f"  [+] Feeding Speech Frame 1: RMS={res_speech_1.rms_energy:.1f} | State={res_speech_1.state} | Event={res_speech_1.event}")
    print(f"  [+] Feeding Speech Frame 2: RMS={res_speech_2.rms_energy:.1f} | State={res_speech_2.state} | Event={res_speech_2.event}")

    assert res_speech_2.state == VADState.SPEAKING, f"Expected SPEAKING state after min frames, got {res_speech_2.state}"
    assert res_speech_2.event == VADEvent.SPEECH_START, f"Expected SPEECH_START event, got {res_speech_2.event}"
    assert len(speech_started_events) >= 1, "VAD speech_start callback was not invoked"

    # Feed silence until timeout triggers SPEECH_END
    vad.process_frame(silence_frame)  # Marks silence onset
    time.sleep(0.25)
    end_frame_res = vad.process_frame(silence_frame)
    print(f"  [+] Feeding Post-Speech Silence: State={end_frame_res.state} | Event={end_frame_res.event}")
    assert end_frame_res.event == VADEvent.SPEECH_END, f"Expected SPEECH_END event, got {end_frame_res.event}"
    assert end_frame_res.state == VADState.SILENCE, f"Expected return to SILENCE, got {end_frame_res.state}"
    print("  [✓] VAD State Machine validated: SILENCE ➔ SPEECH_START ➔ SPEAKING ➔ SPEECH_END ➔ SILENCE")

    # =========================================================================
    # Part 2: Bidirectional Audio Streaming via Gemini Live
    # =========================================================================
    print_section("2. Bidirectional Audio Streaming with Gemini Live WebSocket")

    client = GeminiLiveClient()
    config = LiveSessionConfig(
        model="gemini-3.8-live",
        modalities=["TEXT", "AUDIO"],
        voice_name="Puck"
    )

    t0_conn = time.perf_counter()
    session, session_ctx = await client.connect(config)
    conn_ms = (time.perf_counter() - t0_conn) * 1000
    print(f"  [✓] Live WebSocket Connected ({conn_ms:.2f} ms). Modalities: {config.modalities}")

    # Synthesize 1.0 second 16kHz user voice input
    input_pcm = generate_synthetic_pcm_speech(duration_sec=1.0, sample_rate=16000, base_freq=220.0)
    print(f"  [TX] Streaming {len(input_pcm)} bytes 16kHz PCM audio to Gemini Live API...")

    rx_packets = []

    def on_packet(packet: bytes):
        rx_packets.append(packet)

    t0_turn = time.perf_counter()
    response = await client.stream_audio_turn(
        session=session,
        pcm_input=input_pcm,
        on_audio_packet=on_packet
    )
    turn_latency_ms = (time.perf_counter() - t0_turn) * 1000

    print(f"  [RX] Turn Latency:          {turn_latency_ms:.2f} ms")
    print(f"  [RX] Response Text:         \"{response.text}\"")
    print(f"  [RX] Audio Packets Recv:    {len(rx_packets)}")
    rx_audio_len = len(response.audio_bytes) if response.audio_bytes else 0
    print(f"  [RX] Total Audio Recv:      {rx_audio_len} bytes 24kHz PCM")

    assert response.turn_complete, "Fatal: Audio streaming turn was not marked complete"
    assert rx_audio_len > 0, "Fatal: Expected non-empty audio response bytes from Live API"

    # =========================================================================
    # Part 3: Serialization & Local Playback Engine
    # =========================================================================
    print_section("3. Serialization & Local Audio Verification")

    logs_dir = ROOT_DIR / "logs"
    wav_file = logs_dir / "latest_gemini_response.wav"
    pcm_to_wav(response.audio_bytes, str(wav_file), sample_rate=24000)

    with wave.open(str(wav_file), "rb") as wf:
        n_channels = wf.getnchannels()
        sampwidth = wf.getsampwidth()
        framerate = wf.getframerate()
        n_frames = wf.getnframes()
        duration_sec = n_frames / float(framerate)

    print(f"  [✓] WAV File Created:       {wav_file.name}")
    print(f"  [✓] Channels:               {n_channels} (Mono)")
    print(f"  [✓] Sample Width:           {sampwidth * 8}-bit")
    print(f"  [✓] Sample Rate:            {framerate} Hz (Gemini 24kHz)")
    print(f"  [✓] Audio Duration:         {duration_sec:.2f} seconds")

    assert n_channels == 1, f"Expected 1 channel, got {n_channels}"
    assert framerate == 24000, f"Expected 24000 Hz, got {framerate}"

    # =========================================================================
    # Part 4: Voice Barge-In & Instant Playback Interruption Test
    # =========================================================================
    print_section("4. Voice Barge-In & Sub-50ms Interruption Test")

    player = CancellableAudioPlayer(output_dir=logs_dir)
    barge_in_triggered = []

    def handle_barge_in(report):
        barge_in_triggered.append(report)

    barge_controller = BargeInController(
        audio_player=player,
        vad=vad,
        on_barge_in=handle_barge_in
    )

    # 1. Start assistant audio playback with long audio buffer (2 seconds)
    long_speech_pcm = generate_synthetic_pcm_speech(duration_sec=2.0, sample_rate=24000, base_freq=300.0)
    barge_controller.start_assistant_turn(long_speech_pcm, sample_rate=24000)

    # Allow playback to begin
    time.sleep(0.05)
    print(f"  [+] Assistant Audio Playback Started: is_playing={barge_controller.is_assistant_speaking}")
    assert barge_controller.is_assistant_speaking, "Assistant audio player failed to start playing"

    # 2. Simulate User Speech onset (Barge-in incident)
    print("  [⚡] User interrupts! Feeding speech frames into BargeInController...")
    vad.reset()
    # Feed 2 speech frames to trigger SPEECH_START
    barge_controller.process_user_audio_frame(speech_frame)
    frame_report = barge_controller.process_user_audio_frame(speech_frame)

    # Verify barge-in took effect immediately
    assert len(barge_in_triggered) == 1, "Barge-in callback was not triggered"
    barge_report = barge_in_triggered[0]

    print(f"  [✓] Interruption Latency:   {barge_report.interruption_latency_ms:.2f} ms")
    print(f"  [✓] Cutoff at Playback Sec: {barge_report.playback_duration_before_cut_sec:.3f} s")
    print(f"  [✓] User Trigger RMS:       {barge_report.user_rms_energy:.1f}")
    print(f"  [✓] Assistant Is Playing:   {barge_controller.is_assistant_speaking} (expected: False)")

    assert not barge_controller.is_assistant_speaking, "Audio playback was not stopped after barge-in"
    assert barge_report.interruption_latency_ms < 50.0, (
        f"Interruption latency {barge_report.interruption_latency_ms:.2f}ms exceeded sub-50ms requirement"
    )

    # =========================================================================
    # Part 5: Visual Inspection Matrix
    # =========================================================================
    print_section("5. Visual Diagnostic Summary Matrix")
    print("┌──────────────────────────────┬─────────────────────────────────────────────────────────────────┐")
    print("│ Metric / Diagnostic          │ Value                                                           │")
    print("├──────────────────────────────┼─────────────────────────────────────────────────────────────────┤")
    print(f"│ Target Gemini Model          │ {config.model.ljust(63)} │")
    print(f"│ Modalities Active            │ {', '.join(config.modalities).ljust(63)} │")
    print(f"│ VAD Energy Threshold (RMS)   │ {f'{vad.energy_threshold:.1f}'.ljust(63)} │")
    print(f"│ VAD Speech Onset Frame Window│ {f'{vad.min_speech_frames} frames ({vad.min_speech_frames * vad.frame_duration_ms:.0f} ms)'.ljust(63)} │")
    print(f"│ Live Audio Roundtrip Latency │ {f'{turn_latency_ms:.2f} ms'.ljust(63)} │")
    print(f"│ Synthesized Audio Format     │ {'24,000 Hz 16-bit PCM (RIFF WAV encoded)'.ljust(63)} │")
    print(f"│ Interruption / Barge-in Speed│ {f'{barge_report.interruption_latency_ms:.2f} ms (< 50ms SLA)'.ljust(63)} │")
    print(f"│ Barge-in Status              │ {'ACTIVE & VERIFIED'.ljust(63)} │")
    print("└──────────────────────────────┴─────────────────────────────────────────────────────────────────┘")

    # Clean close session
    if session_ctx:
        await session_ctx.__aexit__(None, None, None)
    elif session:
        await session.close()
    print("  [✓] Gemini Live WebSocket closed cleanly.")

    # =========================================================================
    # Part 6: Structured Metrics Log File Check
    # =========================================================================
    print_section("6. Structured Metrics File Check")
    assert METRICS_LOG_PATH.exists(), f"Metrics file {METRICS_LOG_PATH} not found."
    with open(METRICS_LOG_PATH, "r", encoding="utf-8") as f:
        metrics = [line.strip() for line in f if line.strip()]

    barge_metrics = [m for m in metrics if "barge_in_interruption" in m]
    audio_metrics = [m for m in metrics if "gemini_live_audio_turn" in m]

    print(f"  [✓] telemetry_metrics.jsonl contains {len(metrics)} structured events.")
    print(f"  [✓] Audio Turn events logged:     {len(audio_metrics)}")
    print(f"  [✓] Barge-In Interruption events: {len(barge_metrics)}")
    assert len(barge_metrics) >= 1, "Missing barge_in_interruption event in metrics log"

    print_banner("STEP 3.2 TEST PASSED SUCCESSFULLY: VAD & BARGE-IN AUDIO STREAMING VERIFIED")
    return 0


def main():
    return asyncio.run(run_async_test())


if __name__ == "__main__":
    sys.exit(main())
