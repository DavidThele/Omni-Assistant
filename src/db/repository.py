"""
Telemetry repository handling database interactions with timing instrumentation.
Implements relational CRUD and Step 1.2 FTS5 keyword & full-text search.
"""

import json
import re
import time
from typing import Any, Dict, List, Optional
from pathlib import Path

import pysqlite3 as sqlite3

from ..logger import log_metric
from .connection import get_db_connection
from .schema import init_db_schema


class TelemetryRepository:
    """Repository for managing telemetry_logs and FTS5 search in SQLite."""

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
        FTS5 triggers automatically index content and file_path.
        Technical Constraint 2: SQLite write transaction is isolated and brief.
        """
        start_time = time.perf_counter()
        meta_str = json.dumps(metadata or {})
        payload_size = len(content.encode("utf-8")) + len(meta_str.encode("utf-8"))

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

    def _sanitize_fts_query(self, query: str) -> str:
        """
        Sanitizes raw search terms into valid FTS5 expressions while
        preserving valid boolean operators and wildcards.
        """
        q = query.strip()
        if not q:
            return '""'
        # If user wrapped in double quotes, preserve exact phrase
        if q.startswith('"') and q.endswith('"') and len(q) > 1:
            return q
        # If explicit FTS5 operators are present (AND, OR, NOT, NEAR)
        if any(op in q for op in [" AND ", " OR ", " NOT ", " NEAR"]):
            return q
        # If prefix query ending with *
        if q.endswith("*"):
            clean_term = re.sub(r'[^\w\-]', '', q[:-1])
            return f"{clean_term}*" if clean_term else '""'
        # Default: quote tokens or tokenize safely
        tokens = re.findall(r'[\w\-]+', q)
        if not tokens:
            return '""'
        return " ".join(tokens)

    def search_keyword(self, query: str, limit: int = 10) -> List[sqlite3.Row]:
        """
        Step 1.2: Executes FTS5 keyword search ordered by BM25 rank.
        Returns matching records joined with base table and snippet highlight.
        """
        start_time = time.perf_counter()
        fts_query = self._sanitize_fts_query(query)

        cursor = self.conn.cursor()
        try:
            cursor.execute(
                """
                SELECT 
                    l.id,
                    l.timestamp,
                    l.file_path,
                    l.event_type,
                    l.content,
                    l.metadata,
                    f.rank AS bm25_rank,
                    snippet(telemetry_fts, 0, '«', '»', '...', 10) AS snippet
                FROM telemetry_fts f
                JOIN telemetry_logs l ON l.id = f.rowid
                WHERE telemetry_fts MATCH ?
                ORDER BY f.rank ASC
                LIMIT ?;
                """,
                (fts_query, limit)
            )
            rows = cursor.fetchall()
            status = "success"
        except sqlite3.OperationalError as e:
            # Fallback to strict tokenized search if syntax error in user operator
            clean_q = query.replace('"', "")
            cursor.execute(
                """
                SELECT 
                    l.id,
                    l.timestamp,
                    l.file_path,
                    l.event_type,
                    l.content,
                    l.metadata,
                    f.rank AS bm25_rank,
                    snippet(telemetry_fts, 0, '«', '»', '...', 10) AS snippet
                FROM telemetry_fts f
                JOIN telemetry_logs l ON l.id = f.rowid
                WHERE telemetry_fts MATCH ?
                ORDER BY f.rank ASC
                LIMIT ?;
                """,
                (f'"{clean_q}"', limit)
            )
            rows = cursor.fetchall()
            status = "fallback"

        latency_ms = (time.perf_counter() - start_time) * 1000
        log_metric(
            "search_fts5",
            latency_ms,
            payload_size=len(query.encode("utf-8")),
            status=status,
            details={"query": query, "fts_query": fts_query, "matches": len(rows)}
        )
        return rows

    def close(self):
        """Closes the underlying database connection."""
        if self.conn:
            self.conn.close()
