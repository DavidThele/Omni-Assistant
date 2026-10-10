"""
Database schema definition and initialization for Project Omni-Assistant.
Implements Step 1.1 relational telemetry schema.
"""

from typing import Optional
from pathlib import Path

import pysqlite3 as sqlite3

from .connection import get_db_connection


CREATE_TELEMETRY_LOGS_TABLE_SQL = """
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
"""


def init_db_schema(conn: Optional[sqlite3.Connection] = None, db_path: Optional[str | Path] = None) -> sqlite3.Connection:
    """
    Initializes the local SQLite database schema for Phase 1 Step 1.1.
    Creates telemetry_logs table and supporting indices.
    """
    close_after = False
    if conn is None:
        conn = get_db_connection(db_path)
        close_after = False

    conn.executescript(CREATE_TELEMETRY_LOGS_TABLE_SQL)
    return conn
