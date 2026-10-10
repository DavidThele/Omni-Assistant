"""
Database connection manager with extension loading support.
Uses pysqlite3-binary fallback to ensure enable_load_extension(True) works on macOS.
"""

from pathlib import Path
from typing import Optional

# Technical Constraint 1: Prefer pysqlite3-binary if installed to bypass
# macOS system Python restrictions where extension loading is disabled.
import pysqlite3 as sqlite3

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = BASE_DIR / "omni_memory.db"


def enable_extensions_if_supported(conn: sqlite3.Connection) -> bool:
    """Enables SQLite extension loading if supported by current driver."""
    if hasattr(conn, "enable_load_extension"):
        try:
            conn.enable_load_extension(True)
            return True
        except Exception:
            return False
    return False


def get_db_connection(db_path: Optional[str | Path] = None) -> sqlite3.Connection:
    """
    Returns an optimized, WAL-mode SQLite connection with row factories enabled.
    Configures busy timeout to prevent transient locks during high telemetry concurrency.
    """
    path = str(db_path or DEFAULT_DB_PATH)
    conn = sqlite3.connect(path, timeout=10.0, isolation_level=None)  # autocommit mode by default; explicit transactions used for atomic batches
    conn.row_factory = sqlite3.Row

    # Performance and concurrency optimizations for macOS daemons
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    conn.execute("PRAGMA foreign_keys = ON;")

    enable_extensions_if_supported(conn)
    return conn
