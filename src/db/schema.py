"""
Database schema definition and initialization for Project Omni-Assistant.
Implements Step 1.1 relational schema, Step 1.2 FTS5 full-text indexing,
and Step 1.3 sqlite-vec / vector storage.
"""

from typing import Optional
from pathlib import Path
try:
    import pysqlite3 as sqlite3
except ImportError:
    import sqlite3

from .connection import get_db_connection


CREATE_BASE_SCHEMA_SQL = """
-- 1. Base Relational Telemetry Table
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_path TEXT,
    event_type TEXT DEFAULT 'general',
    content TEXT NOT NULL,
    metadata TEXT DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_telemetry_logs_timestamp ON telemetry_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_logs_event_type ON telemetry_logs(event_type);

-- 2. FTS5 Virtual Table for Fast Keyword & Full-Text Search
CREATE VIRTUAL TABLE IF NOT EXISTS telemetry_fts USING fts5(
    content,
    file_path,
    content='telemetry_logs',
    content_rowid='id',
    tokenize='porter unicode61'
);

-- 3. Automatic Synchronization Triggers for FTS5
CREATE TRIGGER IF NOT EXISTS telemetry_logs_ai AFTER INSERT ON telemetry_logs BEGIN
    INSERT INTO telemetry_fts(rowid, content, file_path) 
    VALUES (new.id, new.content, new.file_path);
END;

CREATE TRIGGER IF NOT EXISTS telemetry_logs_ad AFTER DELETE ON telemetry_logs BEGIN
    INSERT INTO telemetry_fts(telemetry_fts, rowid, content, file_path) 
    VALUES('delete', old.id, old.content, old.file_path);
END;

CREATE TRIGGER IF NOT EXISTS telemetry_logs_au AFTER UPDATE ON telemetry_logs BEGIN
    INSERT INTO telemetry_fts(telemetry_fts, rowid, content, file_path) 
    VALUES('delete', old.id, old.content, old.file_path);
    INSERT INTO telemetry_fts(rowid, content, file_path) 
    VALUES (new.id, new.content, new.file_path);
END;
"""


def init_db_schema(conn: Optional[sqlite3.Connection] = None, db_path: Optional[str | Path] = None) -> sqlite3.Connection:
    """
    Initializes the local SQLite database schema for Phase 1 (Relational + FTS5 + Vector).
    Handles sqlite-vec virtual table initialization with fallback vector storage.
    """
    if conn is None:
        conn = get_db_connection(db_path)

    # 1. Base Relational & FTS5
    conn.executescript(CREATE_BASE_SCHEMA_SQL)

    # 2. Vector Table: Attempt sqlite-vec vec0 virtual table; fallback to blob table if extension not loaded
    try:
        conn.execute(
            """
            CREATE VIRTUAL TABLE IF NOT EXISTS telemetry_vec USING vec0(
                id INTEGER PRIMARY KEY,
                embedding float[384] distance_metric=cosine
            );
            """
        )
    except Exception:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS telemetry_vec (
                id INTEGER PRIMARY KEY,
                embedding BLOB NOT NULL,
                FOREIGN KEY (id) REFERENCES telemetry_logs(id) ON DELETE CASCADE
            );
            """
        )

    return conn


def rebuild_fts_index(conn: sqlite3.Connection) -> None:
    """Rebuilds the FTS5 index from the base telemetry_logs table."""
    conn.execute("INSERT INTO telemetry_fts(telemetry_fts) VALUES('rebuild');")
