"""
Telemetry repository handling database interactions with timing instrumentation.
"""

import json
import time
from typing import Any, Dict, List, Optional
from pathlib import Path

try:
    import pysqlite3 as sqlite3
except ImportError:
    import sqlite3

from ..logger import log_metric
from .connection import get_db_connection
from .schema import init_db_schema


class TelemetryRepository:
    """Repository for managing telemetry_logs records in SQLite."""

    def __init__(self, db_path: Optional[str | Path] = None):
        self.db_path = db_path
        self.conn = get_db_connection(db_path)
        init_db_schema(self.conn)

    def insert_log(
        self,
        content: str,
        file_path: Optional[str] = None,
        event_type: str = "general",
        metadata: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Inserts a single telemetry record into telemetry_logs.
        Technical Constraint 2: SQLite write transaction is isolated and brief.
        """
        start_time = time.perf_counter()
        meta_str = json.dumps(metadata or {})
        payload_size = len(content.encode("utf-8")) + len(meta_str.encode("utf-8"))

        # Explicit quick write transaction
        cursor = self.conn.cursor()
        cursor.execute("BEGIN IMMEDIATE;")
        try:
            cursor.execute(
                """
                INSERT INTO telemetry_logs (file_path, event_type, content, metadata)
                VALUES (?, ?, ?, ?);
                """,
                (file_path, event_type, content, meta_str)
            )
            inserted_id = cursor.lastrowid
            self.conn.execute("COMMIT;")
        except Exception as e:
            self.conn.execute("ROLLBACK;")
            log_metric("insert_telemetry_log", (time.perf_counter() - start_time) * 1000, payload_size, status="error", details={"error": str(e)})
            raise e

        latency_ms = (time.perf_counter() - start_time) * 1000
        log_metric("insert_telemetry_log", latency_ms, payload_size, status="success", details={"inserted_id": inserted_id, "event_type": event_type})
        return inserted_id

    def get_log_by_id(self, log_id: int) -> Optional[sqlite3.Row]:
        """Fetch a specific log record by its primary key ID."""
        start_time = time.perf_counter()
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM telemetry_logs WHERE id = ?;", (log_id,))
        row = cursor.fetchone()
        latency_ms = (time.perf_counter() - start_time) * 1000
        log_metric("get_log_by_id", latency_ms, status="success" if row else "not_found", details={"log_id": log_id})
        return row

    def get_recent_logs(self, limit: int = 10) -> List[sqlite3.Row]:
        """Fetch the most recent N telemetry records."""
        start_time = time.perf_counter()
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM telemetry_logs ORDER BY id DESC LIMIT ?;", (limit,))
        rows = cursor.fetchall()
        latency_ms = (time.perf_counter() - start_time) * 1000
        log_metric("get_recent_logs", latency_ms, status="success", details={"count": len(rows)})
        return rows

    def count_logs(self) -> int:
        """Count total records in telemetry_logs."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM telemetry_logs;")
        return cursor.fetchone()[0]

    def close(self):
        """Closes the underlying database connection."""
        if self.conn:
            self.conn.close()
