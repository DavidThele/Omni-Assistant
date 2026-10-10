"""
Project Omni-Assistant - Logging & Error Handling Architecture
Implements hybrid logging (system_crash.log and telemetry_metrics.jsonl)
with "Loud and Brittle" fail-fast mechanics.
"""

import json
import logging
import os
import sys
import time
import traceback
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)

CRASH_LOG_PATH = LOGS_DIR / "system_crash.log"
METRICS_LOG_PATH = LOGS_DIR / "telemetry_metrics.jsonl"


def log_metric(operation: str, latency_ms: float, payload_size: int = 0, status: str = "success", details: dict = None) -> None:
    """Log structured performance metrics to telemetry_metrics.jsonl."""
    entry = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "operation": operation,
        "latency_ms": round(latency_ms, 3),
        "payload_size_bytes": payload_size,
        "status": status,
        "details": details or {}
    }
    with open(METRICS_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def log_crash(exc_type, exc_value, exc_traceback) -> None:
    """Catches fatal exceptions and writes full traceback to system_crash.log."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    tb_str = "".join(traceback.format_exception(exc_type, exc_value, exc_traceback))
    separator = "=" * 80
    crash_report = (
        f"\n{separator}\n"
        f"CRASH TIMESTAMP: {timestamp}\n"
        f"EXCEPTION: {exc_type.__name__}: {exc_value}\n"
        f"{separator}\n"
        f"{tb_str}\n"
        f"{separator}\n"
    )
    with open(CRASH_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(crash_report)
    
    # Also record failure in structured metrics
    log_metric(
        operation="system_fatal_error",
        latency_ms=0.0,
        status="crash",
        details={"error_type": exc_type.__name__, "message": str(exc_value)}
    )


def install_loud_and_brittle_failsafe() -> None:
    """
    Installs global exception hook.
    Per specification: In development, there is no graceful degradation.
    System raises exception and crashes immediately to force root-cause debugging.
    """
    def custom_excepthook(exc_type, exc_value, exc_traceback):
        log_crash(exc_type, exc_value, exc_traceback)
        sys.__excepthook__(exc_type, exc_value, exc_traceback)

    sys.excepthook = custom_excepthook
