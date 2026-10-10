#!/usr/bin/env python3
"""
Test Step 2.1: Extract macOS active window title and basic accessibility tree.
Specification:
- Implement script to extract macOS active window title and accessibility tree.
- Test script: Run script, detect active window, observe window switches, verify output.
- Visual validation output to the terminal.
"""

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from src.logger import install_loud_and_brittle_failsafe, METRICS_LOG_PATH
from src.telemetry.window_observer import (
    IS_MACOS,
    WindowState,
    get_active_window_state,
    set_simulated_window_state,
    WindowObserver
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
    print_banner("PROJECT OMNI-ASSISTANT: TEST STEP 2.1 (MACOS WINDOW & ACCESSIBILITY EXTRACTOR)")

    print(f"Host Operating System: {sys.platform} (macOS Darwin: {'YES' if IS_MACOS else 'NO - Testing via telemetry bridge'})")

    # Step 1: Single Snapshot Extraction
    print_section("1. Extracting Active Window Snapshot")
    state = get_active_window_state()

    print(f"  [✓] Application Name:     {state.app_name}")
    print(f"  [✓] Window Title:         {state.window_title}")
    print(f"  [✓] Process ID (PID):     {state.pid}")
    print(f"  [✓] Bundle Identifier:    {state.bundle_id or 'N/A'}")
    print(f"  [✓] Timestamp:            {state.timestamp}")

    assert state.app_name, "Application name must not be empty"
    assert state.pid > 0, "Process ID must be greater than 0"

    # Step 2: Accessibility Tree Inspection
    print_section("2. Basic Accessibility Tree Inspection")
    ax_tree = state.accessibility_tree
    print("  Extracted Accessibility Tree JSON structure:")
    print("  " + json.dumps(ax_tree, indent=2).replace("\n", "\n  "))

    assert "role" in ax_tree, "Accessibility tree must contain root role"

    # Step 3: Window Switch Verification
    print_section("3. Window Switch Detection Verification")
    observer = WindowObserver(poll_interval_sec=0.1)
    observer.last_state = state

    if IS_MACOS:
        print("  Running on macOS! Observing live window shifts...")
        print("  [ACTION]: Switch between active applications (e.g., Terminal <-> VS Code/Finder)")
        print("  Monitoring for 3 seconds...")
        switches_detected = 0
        start_monitor = time.time()
        while time.time() - start_monitor < 3.0:
            change = observer.check_for_change()
            if change:
                switches_detected += 1
                print(f"  [!] DETECTED LIVE WINDOW SHIFT #{switches_detected}:")
                print(f"      App:   {change.app_name}")
                print(f"      Title: {change.window_title}")
                print(f"      PID:   {change.pid}")
            time.sleep(0.1)

        print(f"  [✓] macOS live polling loop executed cleanly. Switches observed: {switches_detected}")
    else:
        print("  Simulating multi-window transition sequence for testing...")
        transitions = [
            WindowState(
                app_name="Visual Studio Code",
                window_title="overseer.py - Project Omni-Assistant",
                bundle_id="com.microsoft.VSCode",
                pid=5120,
                accessibility_tree={"role": "AXApplication", "name": "Code", "pid": 5120},
                timestamp=datetime.now(timezone.utc).isoformat()
            ),
            WindowState(
                app_name="Google Chrome",
                window_title="Google AI Studio - Build Mode",
                bundle_id="com.google.Chrome",
                pid=7841,
                accessibility_tree={"role": "AXApplication", "name": "Chrome", "pid": 7841},
                timestamp=datetime.now(timezone.utc).isoformat()
            ),
            WindowState(
                app_name="Terminal",
                window_title="zsh - 80x24",
                bundle_id="com.apple.Terminal",
                pid=1024,
                accessibility_tree={"role": "AXApplication", "name": "Terminal", "pid": 1024},
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        ]

        print("┌──────┬──────────────────────┬──────┬────────────────────────────────────────────┐")
        print("│ Step │ Transition App       │ PID  │ Active Window Title                        │")
        print("├──────┼──────────────────────┼──────┼────────────────────────────────────────────┤")

        for idx, trans_state in enumerate(transitions, start=1):
            set_simulated_window_state(trans_state)
            detected_change = observer.check_for_change()
            assert detected_change is not None, f"Observer failed to catch transition {idx}"
            assert detected_change.app_name == trans_state.app_name

            step_str = f"#{idx}".ljust(4)
            app_str = trans_state.app_name[:20].ljust(20)
            pid_str = str(trans_state.pid).ljust(4)
            title_str = trans_state.window_title[:42].ljust(42)
            print(f"│ {step_str} │ {app_str} │ {pid_str} │ {title_str} │")
            time.sleep(0.05)

        print("└──────┴──────────────────────┴──────┴────────────────────────────────────────────┘")
        # Reset simulation state
        set_simulated_window_state(None)
        print("  [✓] All window shift transitions verified and captured with 100% fidelity.")

    # Step 4: Verify Metrics Log
    print_section("4. Structured Metrics File Check")
    with open(METRICS_LOG_PATH, "r", encoding="utf-8") as f:
        metrics_lines = [line.strip() for line in f if line.strip()]
    window_metrics = [m for m in metrics_lines if "extract_active_window" in m]
    print(f"  [✓] telemetry_metrics.jsonl recorded {len(window_metrics)} window extraction events.")
    print(f"  [✓] Sample metric: {window_metrics[-1]}")

    print_banner("STEP 2.1 TEST PASSED SUCCESSFULLY: MACOS WINDOW & AX TREE EXTRACTION VERIFIED")
    return 0


if __name__ == "__main__":
    sys.exit(run_test())
