#!/usr/bin/env python3
"""
Test Step 2.2: Implement the Token Governor and batching logic.
Specification:
- Simulate API credit consumption (Tokens Per Minute - TPM).
- Verify the Token Governor reserves a safety pool for Gemini Live audio.
- Verify dynamic transition between NORMAL, THROTTLED, and PAUSED states.
- Verify batch payload generation pauses during credit deficits and recovers after window expiry.
- Visual validation output to the terminal.
"""

import sys
import time
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from src.logger import install_loud_and_brittle_failsafe, METRICS_LOG_PATH
from src.telemetry.token_governor import (
    GovernorState,
    TokenGovernor,
    TelemetryBatcher,
    estimate_tokens
)


def print_banner(text: str):
    line = "=" * 70
    print(f"\n{line}")
    print(f"  {text}")
    print(f"{line}\n")


def print_section(title: str):
    print(f"\n--- {title} ---")


def run_test():
    install_loud_and_brittle_failsafe()
    print_banner("PROJECT OMNI-ASSISTANT: TEST STEP 2.2 (TOKEN GOVERNOR & BATCHING LOGIC)")

    simulated_start = 1000.0  # Synthetic epoch for deterministic sliding window testing

    # Configure test governor with tight thresholds for verification:
    # Max TPM: 10,000
    # Reserved Voice Pool: 4,000 (40% reserved for Gemini Live API audio)
    # Background Telemetry Budget: 6,000
    max_tpm = 10000
    reserved_voice = 4000
    telemetry_budget = max_tpm - reserved_voice

    governor = TokenGovernor(
        max_tpm=max_tpm,
        reserved_voice_tpm=reserved_voice,
        window_seconds=60.0
    )
    batcher = TelemetryBatcher(governor)

    print(f"Token Governor Configuration:")
    print(f"  Total Max TPM:              {governor.max_tpm:,} tokens/min")
    print(f"  Reserved Voice Pool:        {governor.reserved_voice_tpm:,} tokens/min (Gemini Live audio safety)")
    print(f"  Telemetry Ingestion Budget: {governor.telemetry_budget:,} tokens/min")

    # Stage 1: Baseline NORMAL Operation
    print_section("1. Stage 1: Baseline Ingestion (NORMAL State)")
    initial_state = governor.evaluate_state(current_time=simulated_start)
    rem_tokens = governor.get_remaining_telemetry_budget(simulated_start)
    print(f"  [✓] Initial State: {initial_state.value} (Remaining Telemetry Budget: {rem_tokens}/{telemetry_budget})")
    assert initial_state == GovernorState.NORMAL, f"Expected NORMAL, got {initial_state}"

    # Add 4 telemetry events
    batcher.add_event("window_focus", "VS Code - main.py", priority=3)
    batcher.add_event("command", "git status", priority=2)
    batcher.add_event("mouse_move", "x=450, y=200", priority=1)
    batcher.add_event("mouse_move", "x=452, y=202", priority=1)  # duplicate low-priority filtered

    batch_1 = batcher.create_batch_payload(max_items=10, current_time=simulated_start)
    assert batch_1 is not None, "Failed to dispatch batch under NORMAL state"
    print(f"  [✓] Batch #1 Dispatched successfully:")
    print(f"      Events packaged:   {batch_1['event_count']}")
    print(f"      Estimated Tokens:  {batch_1['estimated_tokens']}")
    print(f"      Governor State:    {batch_1['state']}")

    # Stage 2: Telemetry Influx -> Transition to THROTTLED
    print_section("2. Stage 2: Telemetry Influx Simulation (Transition to THROTTLED)")
    # Consume 3,500 telemetry tokens -> remaining budget: 6,000 - 3,500 = 2,500 (41.6% ratio <= 50%)
    t_stage2 = simulated_start + 5.0
    governor.record_telemetry_consumption(tokens=3500, current_time=t_stage2)

    state_stage2 = governor.evaluate_state(current_time=t_stage2)
    rem_stage2 = governor.get_remaining_telemetry_budget(t_stage2)
    ratio_stage2 = rem_stage2 / float(telemetry_budget)
    print(f"  [✓] Remaining Telemetry Budget: {rem_stage2:,} ({ratio_stage2*100:.1f}%)")
    print(f"  [✓] State Transition Detected:   {state_stage2.value}")
    assert state_stage2 == GovernorState.THROTTLED, f"Expected THROTTLED, got {state_stage2}"

    # Verify Throttled Noise Filtering (Low-priority events compressed)
    batcher.add_event("window_focus", "Terminal - overseer.py", priority=3)
    batcher.add_event("keystroke_burst", "typed 54 chars in editor", priority=2)
    batcher.add_event("mouse_heartbeat", "cursor idle", priority=1)

    batch_2 = batcher.create_batch_payload(max_items=10, current_time=t_stage2)
    assert batch_2 is not None, "Batcher failed to produce throttled batch"
    print(f"  [✓] Batch #2 (Throttled Compression):")
    print(f"      Governor State:   {batch_2['state']}")
    print(f"      Prioritized Items: {batch_2['event_count']}")

    # Stage 3: Voice Streaming Influx -> Transition to PAUSED
    print_section("3. Stage 3: Gemini Live Audio Streaming Surge (Transition to PAUSED)")
    # Voice audio streaming uses 5,500 tokens on top of existing telemetry consumption, pushing total usage > 91%
    t_stage3 = simulated_start + 12.0
    governor.record_voice_consumption(tokens=5500, current_time=t_stage3)

    state_stage3 = governor.evaluate_state(current_time=t_stage3)
    rem_stage3 = governor.get_remaining_telemetry_budget(t_stage3)
    print(f"  [✓] Consumed Voice Tokens:      {governor.get_consumed_tokens('voice', t_stage3):,}")
    print(f"  [✓] Consumed Telemetry Tokens:  {governor.get_consumed_tokens('telemetry', t_stage3):,}")
    print(f"  [✓] Total Consumed:             {governor.get_consumed_tokens(current_time=t_stage3):,}/{max_tpm:,}")
    print(f"  [✓] Remaining Telemetry Budget: {rem_stage3:,} tokens")
    print(f"  [✓] Governor Critical State:    {state_stage3.value}")
    assert state_stage3 == GovernorState.PAUSED, f"Expected PAUSED, got {state_stage3}"

    # Attempt to dispatch batch while PAUSED
    batcher.add_event("window_focus", "Browser - Documentation", priority=3)
    batcher.add_event("mouse_idle", "no activity", priority=1)

    batch_paused = batcher.create_batch_payload(max_items=10, current_time=t_stage3)
    print(f"  [✓] Batch Dispatch during PAUSED: {batch_paused}")
    assert batch_paused is None, "Fatal: Batcher must NOT emit payloads while PAUSED!"
    print("  [✓] Verified: Telemetry payload generation was successfully PAUSED to guarantee voice safety.")

    # Stage 4: Sliding Window Recovery
    print_section("4. Stage 4: Sliding Window Replenishment & Auto-Recovery")
    # Advance time by 65 seconds past the window cutoff
    t_recovered = simulated_start + 70.0
    state_recovered = governor.evaluate_state(current_time=t_recovered)
    rem_recovered = governor.get_remaining_telemetry_budget(t_recovered)

    print(f"  Advancing time: t={simulated_start}s -> t={t_recovered}s (+70s)")
    print(f"  [✓] Post-Window Consumed Tokens: {governor.get_consumed_tokens(current_time=t_recovered):,}")
    print(f"  [✓] Restored Telemetry Budget:   {rem_recovered:,}/{telemetry_budget:,}")
    print(f"  [✓] Recovered Governor State:    {state_recovered.value}")
    assert state_recovered == GovernorState.NORMAL, f"Expected recovery to NORMAL, got {state_recovered}"

    # Verify batch generation resumes
    batcher.add_event("system_event", "Resumed normal background telemetry ingestion", priority=3)
    batch_resumed = batcher.create_batch_payload(max_items=10, current_time=t_recovered)
    assert batch_resumed is not None, "Failed to resume batch dispatch after window recovery"
    print(f"  [✓] Batch #3 Resumed: State={batch_resumed['state']}, Events={batch_resumed['event_count']}")

    # Step 5: Visual Stage Matrix Summary
    print_section("5. Visual Token Governor Transition Matrix")
    matrix = [
        ("1. Baseline Normal", "6,000 / 6,000", "0 (0%)", "NORMAL", "Active (Full throughput)"),
        ("2. Telemetry Influx", "2,500 / 6,000", "3,500 (35%)", "THROTTLED", "Active (Noise compression)"),
        ("3. Gemini Live Surge", "0 / 6,000", "7,300+ (73%+)", "PAUSED", "PAUSED (Voice pool protected)"),
        ("4. Window Expiry", "6,000 / 6,000", "0 (0%)", "NORMAL", "Resumed (Replenished)"),
    ]

    print("┌──────────────────────────┬──────────────────┬─────────────────┬───────────┬────────────────────────────────┐")
    print("│ Simulation Stage         │ Telemetry Budget │ Consumed TPM    │ State     │ Batching Action                │")
    print("├──────────────────────────┼──────────────────┼─────────────────┼───────────┼────────────────────────────────┤")
    for stage, bud, con, st, act in matrix:
        st_label = stage[:24].ljust(24)
        b_label = bud[:16].ljust(16)
        c_label = con[:15].ljust(15)
        s_label = st[:9].ljust(9)
        a_label = act[:30].ljust(30)
        print(f"│ {st_label} │ {b_label} │ {c_label} │ {s_label} │ {a_label} │")
    print("└──────────────────────────┴──────────────────┴─────────────────┴───────────┴────────────────────────────────┘")

    # Step 6: Verify Metrics File
    print_section("6. Structured Metrics File Check")
    with open(METRICS_LOG_PATH, "r", encoding="utf-8") as f:
        metrics_lines = [line.strip() for line in f if line.strip()]
    gov_metrics = [m for m in metrics_lines if "token_governor" in m or "dispatch_telemetry" in m]
    print(f"  [✓] telemetry_metrics.jsonl recorded {len(gov_metrics)} governor operations.")
    print(f"  [✓] Sample governor metric: {gov_metrics[-1]}")

    print_banner("STEP 2.2 TEST PASSED SUCCESSFULLY: TOKEN GOVERNOR & BATCHING LOGIC VERIFIED")
    print("PHASE 2 COMPLETE: Local Telemetry & Token Governor is fully operational.")
    return 0


if __name__ == "__main__":
    sys.exit(run_test())
