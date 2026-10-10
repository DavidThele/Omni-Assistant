#!/usr/bin/env python3
"""
Test Step 1.2: Enable and configure FTS5 extension and verify keyword search.
Specification:
- Enable and configure FTS5 extension.
- Insert 5 dummy logs.
- Execute keyword search across multiple query modes (exact, prefix, boolean, phrase).
- Verify automatic synchronization triggers (INSERT, UPDATE, DELETE).
- Visual validation output to the terminal.
"""

import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from src.logger import install_loud_and_brittle_failsafe, METRICS_LOG_PATH
from src.db.connection import get_db_connection
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
    print_banner("PROJECT OMNI-ASSISTANT: TEST STEP 1.2 (FTS5 FULL-TEXT SEARCH)")

    test_db_path = ROOT_DIR / "test_fts_omni_memory.db"
    if test_db_path.exists():
        test_db_path.unlink()

    print(f"Target Database File: {test_db_path}")

    # Step 1: Verify FTS5 Virtual Table & Triggers
    print_section("1. FTS5 Virtual Table & Schema Verification")
    conn = get_db_connection(test_db_path)
    init_db_schema(conn)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='telemetry_fts';")
    fts_table_exists = cursor.fetchone() is not None
    print(f"  [✓] Virtual table 'telemetry_fts' created: {fts_table_exists}")
    assert fts_table_exists, "Fatal: FTS5 virtual table 'telemetry_fts' not found."

    cursor.execute("SELECT name FROM sqlite_master WHERE type='trigger';")
    triggers = [row[0] for row in cursor.fetchall()]
    print(f"  [✓] Sync triggers created: {', '.join(triggers)}")
    assert "telemetry_logs_ai" in triggers, "Fatal: Insert sync trigger missing."
    assert "telemetry_logs_ad" in triggers, "Fatal: Delete sync trigger missing."
    assert "telemetry_logs_au" in triggers, "Fatal: Update sync trigger missing."

    conn.close()

    # Step 2: Insert Exactly 5 Dummy Logs (Per Step 1.2 Spec)
    print_section("2. Inserting 5 Dedicated Telemetry Logs")
    repo = TelemetryRepository(test_db_path)

    dummy_logs = [
        {
            "content": "Debugging Docker container network timeout on port 8080 during microservice integration test",
            "file_path": "/Users/omni/backend/Dockerfile",
            "event_type": "debug_log",
            "metadata": {"port": 8080, "protocol": "tcp"}
        },
        {
            "content": "Terminal Command: git rebase origin/main encountered merge conflict in schema.py",
            "file_path": "/Users/omni/repo/schema.py",
            "event_type": "command_history",
            "metadata": {"branch": "feature/fts5", "conflict_files": ["schema.py"]}
        },
        {
            "content": "Active Window: Slack - #architecture channel discussion on Overseer agent token budget",
            "file_path": None,
            "event_type": "window_focus",
            "metadata": {"channel": "#architecture", "topic": "token_governor"}
        },
        {
            "content": "VS Code Editor: edited database connection pool timeout to prevent SQLite lock contention",
            "file_path": "/Users/omni/repo/src/db/connection.py",
            "event_type": "editor_edit",
            "metadata": {"lines_changed": 14}
        },
        {
            "content": "Voice Transcript Snapshot: 'Overseer, analyze system crash log for memory leak in daemon'",
            "file_path": None,
            "event_type": "voice_transcript",
            "metadata": {"confidence": 0.96, "audio_len_sec": 3.4}
        }
    ]

    inserted_ids = []
    for idx, item in enumerate(dummy_logs, 1):
        log_id = repo.insert_log(
            content=item["content"],
            file_path=item["file_path"],
            event_type=item["event_type"],
            metadata=item["metadata"]
        )
        inserted_ids.append(log_id)
        print(f"  [+] Log #{log_id} inserted: [{item['event_type']}] {item['content'][:55]}...")

    assert len(inserted_ids) == 5, f"Expected 5 inserted logs, got {len(inserted_ids)}"

    # Step 3: Test Multiple Keyword Search Scenarios
    print_section("3. Executing FTS5 Keyword Searches")

    test_queries = [
        ("Query A (Exact Keyword): 'Docker'", "Docker", 1, 1),
        ("Query B (Prefix Wildcard): 'rebase*'", "rebase*", 1, 2),
        ("Query C (Exact Phrase): '\"Overseer agent\"'", '"Overseer agent"', 1, 3),
        ("Query D (Boolean AND): 'SQLite AND contention'", "SQLite AND contention", 1, 4),
        ("Query E (Phrase / Concept): 'crash AND memory'", "crash AND memory", 1, 5),
        ("Query F (Non-existent Keyword): 'KubernetesCluster'", "KubernetesCluster", 0, None),
    ]

    print("┌──────────────────────────────────┬──────────┬───────────┬──────────────────────────────────────────┐")
    print("│ Query Description                │ Matches  │ BM25 Rank │ Highlighted Snippet                      │")
    print("├──────────────────────────────────┼──────────┼───────────┼──────────────────────────────────────────┤")

    for desc, query_str, expected_count, expected_first_id in test_queries:
        results = repo.search_keyword(query_str)
        match_count = len(results)
        
        # Format columns
        q_label = desc[:32].ljust(32)
        m_label = str(match_count).ljust(8)
        
        if match_count > 0:
            first_match = results[0]
            rank_label = f"{first_match['bm25_rank']:.4f}".ljust(9)
            snippet = first_match["snippet"].replace("\n", " ")[:40].ljust(40)
            if expected_first_id:
                assert first_match["id"] == expected_first_id, f"Query '{query_str}' expected record #{expected_first_id}, got #{first_match['id']}"
        else:
            rank_label = "N/A".ljust(9)
            snippet = "No matching records found.".ljust(40)

        print(f"│ {q_label} │ {m_label} │ {rank_label} │ {snippet} │")
        assert match_count == expected_count, f"Query '{query_str}' expected {expected_count} matches, got {match_count}"

    print("└──────────────────────────────────┴──────────┴───────────┴──────────────────────────────────────────┘")

    # Step 4: Verify Dynamic Trigger Synchronization (UPDATE and DELETE)
    print_section("4. Verifying FTS5 Automatic Trigger Synchronization")

    # Test Update
    print("  Testing UPDATE synchronization...")
    update_cursor = repo.conn.cursor()
    update_cursor.execute(
        "UPDATE telemetry_logs SET content = 'Resolved Docker networking issue via custom bridge network' WHERE id = 1;"
    )
    # Check old keyword doesn't match
    results_old = repo.search_keyword("microservice")
    assert len(results_old) == 0, "FTS5 index still contains old term after UPDATE"
    # Check new keyword matches
    results_new = repo.search_keyword("bridge")
    assert len(results_new) == 1 and results_new[0]["id"] == 1, "FTS5 index failed to reflect UPDATED content"
    print("  [✓] UPDATE trigger correctly synced FTS5 index.")

    # Test Delete
    print("  Testing DELETE synchronization...")
    update_cursor.execute("DELETE FROM telemetry_logs WHERE id = 1;")
    results_deleted = repo.search_keyword("bridge")
    assert len(results_deleted) == 0, "FTS5 index still contains terms from DELETED record"
    print("  [✓] DELETE trigger correctly purged FTS5 index.")

    # Step 5: Check Structured Metrics
    print_section("5. Structured Metrics File Check")
    with open(METRICS_LOG_PATH, "r", encoding="utf-8") as f:
        metrics_lines = [line.strip() for line in f if line.strip()]
    fts_metrics = [m for m in metrics_lines if "search_fts5" in m]
    print(f"  [✓] telemetry_metrics.jsonl recorded {len(fts_metrics)} FTS5 search operations.")
    print(f"  [✓] Sample FTS5 metric: {fts_metrics[-1]}")

    repo.close()

    print_banner("STEP 1.2 TEST PASSED SUCCESSFULLY: ALL FTS5 KEYWORD SEARCHES VERIFIED")
    return 0


if __name__ == "__main__":
    sys.exit(run_test())
