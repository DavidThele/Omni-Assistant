"""
Project Omni-Assistant - Token Governor & Telemetry Batching Middleware.
Guarantees uninterrupted Gemini Live API voice streaming by dynamically throttling
or pausing background telemetry batches based on remaining Tokens Per Minute (TPM).
"""

import json
import time
from collections import deque
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Deque, Dict, List, Optional, Tuple

from ..logger import log_metric


class GovernorState(str, Enum):
    NORMAL = "NORMAL"          # > 50% telemetry budget remaining: normal batching
    THROTTLED = "THROTTLED"    # 15% - 50% remaining: throttled batch interval, noise compression
    PAUSED = "PAUSED"          # < 15% remaining: batch generation paused to protect voice budget


@dataclass
class TokenRecord:
    timestamp: float
    tokens: int
    channel: str  # "voice" or "telemetry"


@dataclass
class TelemetryEvent:
    event_type: str
    content: str
    priority: int = 1  # 1 = low, 2 = medium, 3 = high
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)


def estimate_tokens(text: str) -> int:
    """Rough estimation of token count (~4 characters per token)."""
    if not text:
        return 0
    return max(1, (len(text) + 3) // 4)


class TokenGovernor:
    """
    Tracks Gemini API Token consumption over a rolling 60-second window.
    Reserves a dedicated token pool for Live API bidirectional audio.
    """

    def __init__(
        self,
        max_tpm: int = 60000,
        reserved_voice_tpm: int = 25000,
        window_seconds: float = 60.0
    ):
        self.max_tpm = max_tpm
        self.reserved_voice_tpm = reserved_voice_tpm
        self.telemetry_budget = max_tpm - reserved_voice_tpm
        self.window_seconds = window_seconds

        # Rolling token consumption history
        self.history: Deque[TokenRecord] = deque()
        self.current_state = GovernorState.NORMAL
        self.last_transition_time = time.time()

    def _purge_old_records(self, current_time: Optional[float] = None) -> None:
        """Removes records older than the sliding window."""
        now = current_time if current_time is not None else time.time()
        cutoff = now - self.window_seconds
        while self.history and self.history[0].timestamp < cutoff:
            self.history.popleft()

    def get_consumed_tokens(self, channel: Optional[str] = None, current_time: Optional[float] = None) -> int:
        """Returns total consumed tokens in the rolling window."""
        self._purge_old_records(current_time)
        if channel:
            return sum(r.tokens for r in self.history if r.channel == channel)
        return sum(r.tokens for r in self.history)

    def get_remaining_telemetry_budget(self, current_time: Optional[float] = None) -> int:
        """
        Calculates remaining tokens available for background telemetry without
        impacting the reserved voice pool.
        """
        self._purge_old_records(current_time)
        consumed_telemetry = self.get_consumed_tokens(channel="telemetry", current_time=current_time)
        consumed_voice = self.get_consumed_tokens(channel="voice", current_time=current_time)
        total_consumed = consumed_telemetry + consumed_voice

        # Effective remaining budget for telemetry
        effective_remaining = self.max_tpm - total_consumed - max(0, self.reserved_voice_tpm - consumed_voice)
        return max(0, min(self.telemetry_budget - consumed_telemetry, effective_remaining))

    def evaluate_state(self, current_time: Optional[float] = None) -> GovernorState:
        """
        Evaluates governor state based on remaining telemetry budget ratio:
        > 50%: NORMAL
        15% - 50%: THROTTLED
        < 15%: PAUSED
        """
        now = current_time if current_time is not None else time.time()
        remaining = self.get_remaining_telemetry_budget(now)
        ratio = remaining / float(self.telemetry_budget) if self.telemetry_budget > 0 else 0.0

        prev_state = self.current_state
        if ratio < 0.15:
            new_state = GovernorState.PAUSED
        elif ratio <= 0.50:
            new_state = GovernorState.THROTTLED
        else:
            new_state = GovernorState.NORMAL

        if new_state != prev_state:
            self.current_state = new_state
            self.last_transition_time = now
            log_metric(
                operation="token_governor_transition",
                latency_ms=0.0,
                status="success",
                details={
                    "previous_state": prev_state.value,
                    "new_state": new_state.value,
                    "remaining_telemetry_tokens": remaining,
                    "ratio": round(ratio, 4),
                    "total_consumed": self.get_consumed_tokens(current_time=now)
                }
            )

        return self.current_state

    def record_voice_consumption(self, tokens: int, current_time: Optional[float] = None) -> None:
        """Logs voice tokens consumed by Gemini Live streaming."""
        now = current_time if current_time is not None else time.time()
        self.history.append(TokenRecord(timestamp=now, tokens=tokens, channel="voice"))
        self.evaluate_state(now)

    def record_telemetry_consumption(self, tokens: int, current_time: Optional[float] = None) -> None:
        """Logs telemetry tokens consumed by sent batches."""
        now = current_time if current_time is not None else time.time()
        self.history.append(TokenRecord(timestamp=now, tokens=tokens, channel="telemetry"))
        self.evaluate_state(now)

    def can_dispatch_telemetry(self, estimated_tokens: int, current_time: Optional[float] = None) -> Tuple[bool, GovernorState, str]:
        """
        Checks if a telemetry batch of estimated_tokens can be dispatched.
        Returns: (can_dispatch, current_state, reason)
        """
        now = current_time if current_time is not None else time.time()
        state = self.evaluate_state(now)
        remaining = self.get_remaining_telemetry_budget(now)

        if state == GovernorState.PAUSED:
            return False, state, f"PAUSED: Remaining telemetry tokens ({remaining}) below safety threshold"

        if estimated_tokens > remaining:
            return False, state, f"THROTTLED: Batch tokens ({estimated_tokens}) exceeds remaining budget ({remaining})"

        return True, state, "OK"


class TelemetryBatcher:
    """
    Gathers, compresses, and batches sensory telemetry.
    Respects TokenGovernor rate limits and noise-filtering policies.
    """

    def __init__(self, governor: TokenGovernor):
        self.governor = governor
        self.queue: List[TelemetryEvent] = []
        self.dispatched_batches_count = 0
        self.dropped_events_count = 0

    def add_event(self, event_type: str, content: str, priority: int = 1, metadata: Dict[str, Any] = None) -> None:
        """Buffers a new telemetry event."""
        # Simple deduplication: drop identical consecutive low-priority events
        if self.queue and priority == 1:
            last = self.queue[-1]
            if last.event_type == event_type and last.content == content:
                return

        self.queue.append(TelemetryEvent(
            event_type=event_type,
            content=content,
            priority=priority,
            metadata=metadata or {}
        ))

    def create_batch_payload(self, max_items: int = 10, current_time: Optional[float] = None) -> Optional[Dict[str, Any]]:
        """
        Evaluates governor state, filters noise, and packages batch payload.
        Returns None if Governor pauses batch dispatch.
        """
        if not self.queue:
            return None

        now = current_time if current_time is not None else time.time()
        state = self.governor.evaluate_state(now)

        if state == GovernorState.PAUSED:
            # Drop low priority events to prevent unbounded memory growth while paused
            original_len = len(self.queue)
            self.queue = [e for e in self.queue if e.priority >= 3]
            self.dropped_events_count += (original_len - len(self.queue))
            return None

        # Determine batch slice based on state
        if state == GovernorState.THROTTLED:
            # In throttled state, only send high & medium priority items and compress payload
            candidates = [e for e in self.queue if e.priority >= 2][:max_items // 2 or 1]
            if not candidates and self.queue:
                # If only low priority exists, take at most 1 compressed summary
                candidates = [self.queue[0]]
        else:
            candidates = self.queue[:max_items]

        if not candidates:
            return None

        # Build dense JSON payload
        items_data = [
            {"type": e.event_type, "content": e.content, "priority": e.priority}
            for e in candidates
        ]
        payload_text = json.dumps(items_data)
        token_cost = estimate_tokens(payload_text)

        can_dispatch, curr_state, reason = self.governor.can_dispatch_telemetry(token_cost, now)
        if not can_dispatch:
            return None

        # Commit dispatch: consume tokens and remove from queue
        self.governor.record_telemetry_consumption(token_cost, now)
        for c in candidates:
            if c in self.queue:
                self.queue.remove(c)

        self.dispatched_batches_count += 1
        batch_dict = {
            "batch_id": self.dispatched_batches_count,
            "state": curr_state.value,
            "event_count": len(candidates),
            "estimated_tokens": token_cost,
            "events": items_data,
            "timestamp": now
        }

        log_metric(
            operation="dispatch_telemetry_batch",
            latency_ms=0.0,
            payload_size=len(payload_text.encode("utf-8")),
            status="success",
            details={
                "batch_id": self.dispatched_batches_count,
                "token_cost": token_cost,
                "state": curr_state.value
            }
        )
        return batch_dict
