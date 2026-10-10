"""
Database connection manager with extension loading support.
Configures WAL mode, pragmas, and loads sqlite-vec when available.
"""

from pathlib import Path
from typing import Optional
import pysqlite3 as sqlite3

try:
    import sqlite_vec
    HAS_SQLITE_VEC = True
except ImportError:
    HAS_SQLITE_VEC = False

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = BASE_DIR / "omni_memory.db"


def is_sqlite_vec_installed() -> bool:
    """Returns True if sqlite-vec python package is present."""
    return HAS_SQLITE_VEC


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
    Loads sqlite-vec extension if installed in the current environment.
    """
    path = str(db_path or DEFAULT_DB_PATH)
    conn = sqlite3.connect(path, timeout=10.0, isolation_level=None)
    conn.row_factory = sqlite3.Row

    # Performance and concurrency optimizations for macOS daemons
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    conn.execute("PRAGMA foreign_keys = ON;")

    ext_enabled = enable_extensions_if_supported(conn)
    if ext_enabled and HAS_SQLITE_VEC:
        try:
            sqlite_vec.load(conn)
        except Exception:
            pass

    return conn
