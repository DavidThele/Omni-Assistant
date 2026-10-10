#!/usr/bin/env python3
"""
Test Step 1.4: Reciprocal Rank Fusion (RRF) combining FTS5 keyword and sqlite-vec results.
Specification:
- Implement Reciprocal Rank Fusion algorithm: score(d) = sum(1 / (k + rank_i(d))).
- Query for a specific keyword combined with a semantic concept.
- Verify the hybrid ranked output where documents matching both modalities soar to the top.
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
    print_banner("PROJECT OMNI-ASSISTANT: TEST STEP 1.4 (RECIPROCAL RANK FUSION RRF)")

    test_db_path = ROOT_DIR / "test_rrf_omni_memory.db"
    if test_db_path.exists():
        test_db_path.unlink()

    print(f"Target Database File: {test_db_path}")

    # Step 1: Initialize Database & Repository
    print_section("1. Unified Database Schema Initialization")
    conn = get_db_connection(test_db_path)
    init_db_schema(conn)
    conn.close()

    repo = TelemetryRepository(test_db_path)
    print("  [✓] Repository initialized with Relational + FTS5 + Vector storage.")

    # Step 2: Insert Diverse Telemetry Logs (Keywords + Concepts)
    print_section("2. Populating Test Telemetry Corpus")
    sample_corpus = [
        {
            "content": "Debugging Docker container network timeout on port 8080 during microservice integration test",
            "file_path": "/Users/omni/backend/Dockerfile",
            "event_type": "infrastructure",
            "metadata": {"port": 8080}
        },
        {
            "content": "Terminal Command: git rebase origin/main encountered merge conflict in schema.py",
            "file_path": "/Users/omni/repo/schema.py",
            "event_type": "git_workflow",
            "metadata": {"branch": "main"}
        },
        {
            "content": "Active Window: Slack - #architecture channel discussion on Overseer agent token budget",
            "file_path": None,
            "event_type": "chat",
            "metadata": {"channel": "#architecture"}
        },
        {
            "content": "VS Code Editor: edited database connection pool timeout to prevent SQLite lock contention",
            "file_path": "/Users/omni/repo/src/db/connection.py",
            "event_type": "database",
            "metadata": {"timeout": 5000}
        },
        {
            "content": "Voice Transcript Snapshot: 'Overseer, analyze system crash log for memory leak in daemon'",
            "file_path": None,
            "event_type": "voice_transcript",
            "metadata": {"confidence": 0.98}
        },
        {
            "content": "Automated Deployment: updated Docker service configuration and exposed alternate endpoint on port 8080",
            "file_path": "/Users/omni/backend/deploy.yaml",
            "event_type": "deployment",
            "metadata": {"env": "prod"}
        }
    ]

    corpus_ids = []
    for item in sample_corpus:
        doc_id = repo.insert_log_with_embedding(
            content=item["content"],
            file_path=item["file_path"],
            event_type=item["event_type"],
            metadata=item["metadata"]
        )
        corpus_ids.append(doc_id)
        print(f"  [+] Log #{doc_id} indexed in FTS5 and Vector: [{item['event_type']}] {item['content'][:45]}...")

    assert len(corpus_ids) == 6, f"Expected 6 corpus items, got {len(corpus_ids)}"

    # Step 3: Test Scenario 1 - Hybrid Query (Keyword + Semantic Concept)
    # Target: Log #1 contains keyword 'Docker' AND concept 'network timeout'
    # Log #6 contains keyword 'Docker' but lacks network timeout context
    print_section("3. Scenario 1: Hybrid Keyword + Semantic Concept Query")
    query_1 = "Docker network timeout"
    print(f"  Executing RRF Query: '{query_1}'")

    results_1 = repo.search_hybrid_rrf(query_1, limit=5, k=60)
    assert len(results_1) > 0, "No results returned for hybrid query 1"

    print("\n┌──────┬────────┬───────────┬──────────┬──────────┬─────────────────────────────────────────────────┐")
    print("│ Rank │ Doc ID │ RRF Score │ FTS Rank │ Vec Rank │ Matched Telemetry Content                       │")
    print("├──────┼────────┼───────────┼──────────┼──────────┼─────────────────────────────────────────────────┤")
    for rank_idx, res in enumerate(results_1, start=1):
        r_str = f"#{rank_idx}".ljust(4)
        doc_str = f"#{res['id']}".ljust(6)
        score_str = f"{res['rrf_score']:.6f}".ljust(9)
        fts_str = (f"#{res['fts_rank']}" if res['fts_rank'] else "None").ljust(8)
        vec_str = (f"#{res['vec_rank']}" if res['vec_rank'] else "None").ljust(8)
        preview = res["content"].replace("\n", " ")[:47].ljust(47)
        print(f"│ {r_str} │ {doc_str} │ {score_str} │ {fts_str} │ {vec_str} │ {preview} │")
    print("└──────┴────────┴───────────┴──────────┴──────────┴─────────────────────────────────────────────────┘")

    top_result = results_1[0]
    assert top_result["id"] == 1, f"Expected Log #1 to rank #1 in hybrid search, got #{top_result['id']}"
    assert top_result["fts_rank"] is not None and top_result["vec_rank"] is not None, "Top result must match BOTH modalities!"
    print(f"  [✓] Verified: Log #1 soared to Rank #1 with combined RRF score ({top_result['rrf_score']:.6f}).")

    # Step 4: Test Scenario 2 - Exact Path / Code Symbol + Git Concept
    print_section("4. Scenario 2: Exact File Path Symbol + Workflow Concept")
    query_2 = "schema.py merge conflict"
    print(f"  Executing RRF Query: '{query_2}'")

    results_2 = repo.search_hybrid_rrf(query_2, limit=3, k=60)
    assert len(results_2) > 0, "No results returned for query 2"
    top_2 = results_2[0]
    assert top_2["id"] == 2, f"Expected Log #2 for git workflow query, got #{top_2['id']}"
    print(f"  [✓] Verified: Log #2 ({top_2['file_path']}) ranked #1 (Score: {top_2['rrf_score']:.6f}).")

    # Step 5: Test Scenario 3 - Database Concurrency & Lock Performance
    print_section("5. Scenario 3: Database Concurrency & Table Locks")
    query_3 = "SQLite connection lock contention"
    print(f"  Executing RRF Query: '{query_3}'")

    results_3 = repo.search_hybrid_rrf(query_3, limit=3, k=60)
    top_3 = results_3[0]
    assert top_3["id"] == 4, f"Expected Log #4 for SQLite lock query, got #{top_3['id']}"
    print(f"  [✓] Verified: Log #4 ranked #1 (Score: {top_3['rrf_score']:.6f}).")

    # Step 6: Test Scenario 4 - Audio Voice Diagnostic Snapshot
    print_section("6. Scenario 4: Voice Transcript Crash Inspection")
    query_4 = "voice speech command crash memory leak"
    print(f"  Executing RRF Query: '{query_4}'")

    results_4 = repo.search_hybrid_rrf(query_4, limit=3, k=60)
    top_4 = results_4[0]
    assert top_4["id"] == 5, f"Expected Log #5 for crash diagnosis query, got #{top_4['id']}"
    print(f"  [✓] Verified: Log #5 ranked #1 (Score: {top_4['rrf_score']:.6f}).")

    # Step 7: Verify RRF Mathematical Properties
    print_section("7. Mathematical Validation of RRF Formula")
    # Verify formula: 1 / (60 + r_fts) + 1 / (60 + r_vec)
    k = 60
    for res in results_1:
        expected_score = 0.0
        if res["fts_rank"]:
            expected_score += 1.0 / (k + res["fts_rank"])
        if res["vec_rank"]:
            expected_score += 1.0 / (k + res["vec_rank"])
        diff = abs(res["rrf_score"] - expected_score)
        assert diff < 1e-6, f"RRF math mismatch for doc #{res['id']}: {res['rrf_score']} vs {expected_score}"
    print("  [✓] Mathematical integrity of RRF formula strictly verified.")

    # Step 8: Verify Structured Metrics Log
    print_section("8. Structured Metrics File Check")
    with open(METRICS_LOG_PATH, "r", encoding="utf-8") as f:
        metrics_lines = [line.strip() for line in f if line.strip()]
    rrf_metrics = [m for m in metrics_lines if "search_hybrid_rrf" in m]
    print(f"  [✓] telemetry_metrics.jsonl recorded {len(rrf_metrics)} RRF hybrid operations.")
    print(f"  [✓] Sample RRF metric: {rrf_metrics[-1]}")

    repo.close()

    print_banner("STEP 1.4 TEST PASSED SUCCESSFULLY: ALL RRF HYBRID SEARCH CRITERIA VERIFIED")
    print("PHASE 1 COMPLETE: The Unified Local Database is fully operational.")
    return 0


if __name__ == "__main__":
    sys.exit(run_test())
