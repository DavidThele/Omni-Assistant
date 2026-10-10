"""
Telemetry repository handling database interactions with timing instrumentation.
Implements relational CRUD, FTS5 search, and Step 1.3 vector embeddings & semantic search.
Strictly isolates vector embedding generation outside of SQLite write transactions.
"""

import json
import re
import time
from typing import Any, Dict, List, Optional, Union
from pathlib import Path

import pysqlite3 as sqlite3

from ..logger import log_metric
from ..embeddings import (
    EmbeddingEngine,
    serialize_float32,
    deserialize_float32,
    cosine_distance,
    EMBEDDING_DIM
)
from .connection import get_db_connection
from .schema import init_db_schema


class TelemetryRepository:
    """Repository for managing telemetry_logs, FTS5, and vector embeddings in SQLite."""

    def __init__(self, db_path: Optional[str | Path] = None):
        self.db_path = db_path
        self.conn = get_db_connection(db_path)
        init_db_schema(self.conn)
        self.is_vec0_table = self._check_if_vec0()

    def _check_if_vec0(self) -> bool:
        """Determines if telemetry_vec is a sqlite-vec virtual table or fallback table."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='telemetry_vec';")
        row = cursor.fetchone()
        if row and "vec0" in (row[0] or "").lower():
            return True
        return False

    def insert_log(
        self,
        content: str,
        file_path: Optional[str] = None,
        event_type: str = "general",
        metadata: Optional[Dict[str, Any]] = None
    ) -> int:
        """Standard relational insert (auto-syncs with FTS5)."""
        return self.insert_log_with_embedding(
            content=content,
            file_path=file_path,
            event_type=event_type,
            metadata=metadata,
            auto_embed=False
        )

    def insert_log_with_embedding(
        self,
        content: str,
        file_path: Optional[str] = None,
        event_type: str = "general",
        metadata: Optional[Dict[str, Any]] = None,
        embedding: Optional[List[float]] = None,
        auto_embed: bool = True
    ) -> int:
        """
        Technical Constraint 2: Strictly computes vector embeddings OUTSIDE of SQLite transactions.
        Only holds active write locks during instantaneous record insertion.
        """
        # Step 1: Compute embedding OUTSIDE transaction
        embed_start = time.perf_counter()
        vector_data: Optional[List[float]] = embedding
        if vector_data is None and auto_embed:
            engine = EmbeddingEngine.get_instance()
            vector_data = engine.generate_embedding(content)
        embed_duration_ms = (time.perf_counter() - embed_start) * 1000

        meta_str = json.dumps(metadata or {})
        payload_size = len(content.encode("utf-8")) + len(meta_str.encode("utf-8"))

        # Step 2: Open minimal atomic write transaction
        tx_start = time.perf_counter()
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

            if vector_data is not None:
                packed_vector = serialize_float32(vector_data)
                if self.is_vec0_table:
                    cursor.execute(
                        "INSERT INTO telemetry_vec (id, embedding) VALUES (?, ?);",
                        (inserted_id, packed_vector)
                    )
                else:
                    cursor.execute(
                        "INSERT INTO telemetry_vec (id, embedding) VALUES (?, ?);",
                        (inserted_id, packed_vector)
                    )

            self.conn.execute("COMMIT;")
        except Exception as e:
            self.conn.execute("ROLLBACK;")
            log_metric(
                "insert_telemetry_with_embedding",
                (time.perf_counter() - tx_start) * 1000,
                payload_size,
                status="error",
                details={"error": str(e)}
            )
            raise e

        tx_duration_ms = (time.perf_counter() - tx_start) * 1000
        log_metric(
            "insert_telemetry_with_embedding",
            tx_duration_ms,
            payload_size,
            status="success",
            details={
                "inserted_id": inserted_id,
                "event_type": event_type,
                "embed_compute_ms": round(embed_duration_ms, 3),
                "write_lock_ms": round(tx_duration_ms, 3),
                "vector_dimension": len(vector_data) if vector_data else 0
            }
        )
        return inserted_id

    def search_semantic(
        self,
        query: Union[str, List[float]],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Step 1.3: Executes pure semantic vector similarity search.
        Calculates query vector outside database locks, queries nearest neighbors,
        and returns ranked records with cosine distances.
        """
        start_time = time.perf_counter()

        # Generate query vector in-memory outside DB
        if isinstance(query, str):
            engine = EmbeddingEngine.get_instance()
            query_vector = engine.generate_embedding(query)
            query_text = query
        else:
            query_vector = query
            query_text = "<raw_vector>"

        cursor = self.conn.cursor()
        results: List[Dict[str, Any]] = []

        if self.is_vec0_table:
            # Native sqlite-vec virtual table query
            packed_q = serialize_float32(query_vector)
            cursor.execute(
                """
                SELECT 
                    l.id,
                    l.timestamp,
                    l.file_path,
                    l.event_type,
                    l.content,
                    l.metadata,
                    v.distance
                FROM telemetry_vec v
                JOIN telemetry_logs l ON l.id = v.id
                WHERE v.embedding MATCH ?
                  AND k = ?
                ORDER BY v.distance ASC;
                """,
                (packed_q, limit)
            )
            rows = cursor.fetchall()
            for r in rows:
                dist = float(r["distance"])
                results.append({
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "file_path": r["file_path"],
                    "event_type": r["event_type"],
                    "content": r["content"],
                    "metadata": r["metadata"],
                    "distance": round(dist, 4),
                    "similarity": round(1.0 - dist, 4)
                })
        else:
            # Fallback pure cosine distance evaluation over stored vectors
            cursor.execute(
                """
                SELECT 
                    l.id,
                    l.timestamp,
                    l.file_path,
                    l.event_type,
                    l.content,
                    l.metadata,
                    v.embedding
                FROM telemetry_vec v
                JOIN telemetry_logs l ON l.id = v.id;
                """
            )
            all_rows = cursor.fetchall()
            scored = []
            for r in all_rows:
                stored_vec = deserialize_float32(r["embedding"])
                dist = cosine_distance(query_vector, stored_vec)
                scored.append((dist, r))

            scored.sort(key=lambda x: x[0])
            for dist, r in scored[:limit]:
                results.append({
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "file_path": r["file_path"],
                    "event_type": r["event_type"],
                    "content": r["content"],
                    "metadata": r["metadata"],
                    "distance": round(dist, 4),
                    "similarity": round(1.0 - dist, 4)
                })

        latency_ms = (time.perf_counter() - start_time) * 1000
        log_metric(
            "search_semantic",
            latency_ms,
            payload_size=len(query_text.encode("utf-8")),
            status="success",
            details={"query": query_text, "matches": len(results), "top_distance": results[0]["distance"] if results else None}
        )
        return results

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
        """Sanitizes raw search terms into valid FTS5 expressions."""
        q = query.strip()
        if not q:
            return '""'
        if q.startswith('"') and q.endswith('"') and len(q) > 1:
            return q
        if any(op in q for op in [" AND ", " OR ", " NOT ", " NEAR"]):
            return q
        if q.endswith("*"):
            clean_term = re.sub(r'[^\w\-]', '', q[:-1])
            return f"{clean_term}*" if clean_term else '""'
        tokens = re.findall(r'[\w\-]+', q)
        if not tokens:
            return '""'
        return " ".join(tokens)

    def search_keyword(self, query: str, limit: int = 10) -> List[sqlite3.Row]:
        """Step 1.2: Executes FTS5 keyword search ordered by BM25 rank."""
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
        except sqlite3.OperationalError:
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
