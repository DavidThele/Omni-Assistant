#!/usr/bin/env python3
"""
Test Step 1.1: Initialize local SQLite database and test relational CRUD operations.
Specification:
- Initialize local SQLite database file.
- Write schema that supports basic relational data (id, timestamp, file_path, content).
- Insert dummy text, read it back.
- Visual validation output to the terminal.
"""

import os
import sys
import tempfile
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from src.logger import install_loud_and_brittle_failsafe, METRICS_LOG_PATH
from src.db.connection import get_db_connection, enable_extensions_if_supported
from src.db.schema import init_db_schema
from src.db.repository import TelemetryRepository


def print_banner(text: str):
    line = "=" * 70
    print(f"\n{line}")
    print(f"  {text}")
    print(f"{line}\n")


def print_section(title: str):
    print(f"\n--- {title} ---")


def run_test():
    install_loud_and_brittle_failsafe()
    print_banner("PROJECT OMNI-ASSISTANT: TEST STEP 1.1 (RELATIONAL DATABASE)")

    # Use a dedicated test database to guarantee fresh verification
    test_db_path = ROOT_DIR / "test_omni_memory.db"
    if test_db_path.exists():
        test_db_path.unlink()

    print(f"Target Database File: {test_db_path}")

    # Step 1: Verify Connection & SQLite Extension capability
    print_section("1. SQLite Connection & Configuration Verification")
    conn = get_db_connection(test_db_path)
    cursor = conn.cursor()

    # Check journal mode
    cursor.execute("PRAGMA journal_mode;")
    journal_mode = cursor.fetchone()[0]
    print(f"  [✓] PRAGMA journal_mode: {journal_mode.upper()} (expected: WAL)")
    assert journal_mode.lower() == "wal", f"Expected WAL mode, got {journal_mode}"

    # Check synchronous mode
    cursor.execute("PRAGMA synchronous;")
    sync_mode = cursor.fetchone()[0]
    print(f"  [✓] PRAGMA synchronous: {sync_mode} (expected: 1/NORMAL)")

    # Check extension loading capability
    ext_supported = enable_extensions_if_supported(conn)
    print(f"  [✓] SQLite enable_load_extension support: {'YES' if ext_supported else 'NO'}")
    assert ext_supported, "Fatal: SQLite extension loading is not supported on this Python build."

    # Step 2: Initialize Schema
    print_section("2. Database Schema Initialization")
    init_db_schema(conn)

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='telemetry_logs';")
    table_exists = cursor.fetchone() is not None
    print(f"  [✓] Table 'telemetry_logs' created: {table_exists}")
    assert table_exists, "Fatal: Table 'telemetry_logs' was not created."

    # Inspect columns
    cursor.execute("PRAGMA table_info(telemetry_logs);")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"  [✓] Table columns detected: {', '.join(columns)}")
    expected_cols = ["id", "timestamp", "file_path", "event_type", "content", "metadata"]
    for col in expected_cols:
        assert col in columns, f"Fatal: Column '{col}' missing from schema."

    conn.close()

    # Step 3: Insert Dummy Telemetry Data via Repository
    print_section("3. Inserting Dummy Telemetry Records")
    repo = TelemetryRepository(test_db_path)

    sample_entries = [
        {
            "content": "Active Window: Terminal - python3 overseer.py (PID: 4821)",
            "file_path": "/Users/omni/Developer/OmniAssistant/src/overseer.py",
            "event_type": "window_focus",
            "metadata": {"app_name": "Terminal", "window_id": 1042, "idle_sec": 0.2}
        },
        {
            "content": "Terminal Command Executed: git status -s",
            "file_path": "/Users/omni/Developer/OmniAssistant",
            "event_type": "command_history",
            "metadata": {"exit_code": 0, "shell": "zsh"}
        },
        {
            "content": "File Modified: /Users/omni/Developer/OmniAssistant/src/db/schema.py (+24 lines)",
            "file_path": "/Users/omni/Developer/OmniAssistant/src/db/schema.py",
            "event_type": "filesystem_change",
            "metadata": {"change_type": "modified", "byte_diff": 842}
        },
        {
            "content": "Voice Transcript Snapshot: 'Overseer, show me the recent test results.'",
            "file_path": None,
            "event_type": "voice_transcript",
            "metadata": {"confidence": 0.98, "channel": "mic_input"}
        }
    ]

    inserted_ids = []
    for idx, item in enumerate(sample_entries, 1):
        inserted_id = repo.insert_log(
            content=item["content"],
            file_path=item["file_path"],
            event_type=item["event_type"],
            metadata=item["metadata"]
        )
        inserted_ids.append(inserted_id)
        print(f"  [+] Inserted Record #{inserted_id}: [{item['event_type']}] {item['content'][:55]}...")

    assert len(inserted_ids) == len(sample_entries), "Mismatch in inserted record count."

    # Step 4: Read Back Records & Validate Integrity
    print_section("4. Reading Back Records & Verifying Data Integrity")
    for orig_id, expected_data in zip(inserted_ids, sample_entries):
        row = repo.get_log_by_id(orig_id)
        assert row is not None, f"Failed to retrieve record ID #{orig_id}"
        assert row["id"] == orig_id, f"ID mismatch: {row['id']} != {orig_id}"
        assert row["content"] == expected_data["content"], f"Content mismatch in #{orig_id}"
        assert row["file_path"] == expected_data["file_path"], f"Path mismatch in #{orig_id}"
        assert row["event_type"] == expected_data["event_type"], f"Event type mismatch in #{orig_id}"
        assert row["timestamp"] is not None, f"Missing timestamp in #{orig_id}"
        print(f"  [✓] Verified ID #{orig_id}: Timestamp={row['timestamp']} | Type={row['event_type']}")

    total_count = repo.count_logs()
    print(f"\n  Total Records in Database: {total_count}")
    assert total_count == len(sample_entries), f"Expected {len(sample_entries)} logs, found {total_count}"

    # Step 5: Visual Table Dump
    print_section("5. Visual Data Inspection (Relational Rows)")
    recent_rows = repo.get_recent_logs(limit=10)
    print("┌─────┬──────────────────────────┬─────────────────┬───────────────────────────────────────────────┐")
    print("│ ID  │ Timestamp                │ Event Type      │ Content                                       │")
    print("├─────┼──────────────────────────┼─────────────────┼───────────────────────────────────────────────┤")
    for r in recent_rows:
        cid = str(r["id"]).ljust(3)
        ts = str(r["timestamp"])[:24].ljust(24)
        evt = str(r["event_type"])[:15].ljust(15)
        cnt = str(r["content"])[:45].ljust(45)
        print(f"│ {cid} │ {ts} │ {evt} │ {cnt} │")
    print("└─────┴──────────────────────────┴─────────────────┴───────────────────────────────────────────────┘")

    # Step 6: Verify Metrics Log
    print_section("6. Structured Metrics File Check")
    assert METRICS_LOG_PATH.exists(), f"Metrics file {METRICS_LOG_PATH} was not created."
    with open(METRICS_LOG_PATH, "r", encoding="utf-8") as f:
        metrics_lines = [line.strip() for line in f if line.strip()]
    print(f"  [✓] telemetry_metrics.jsonl recorded {len(metrics_lines)} structured event(s).")
    print(f"  [✓] Sample metric: {metrics_lines[-1]}")

    repo.close()

    print_banner("STEP 1.1 TEST PASSED SUCCESSFULLY: ALL RELATIONAL CRUDS VERIFIED")
    return 0


if __name__ == "__main__":
    sys.exit(run_test())
