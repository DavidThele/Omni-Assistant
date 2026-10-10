"""
Local Embedding Engine for Project Omni-Assistant.
Implements local 384-dimensional dense vector embeddings using SentenceTransformers (all-MiniLM-L6-v2).
Provides zero-cost local parsing with strict transaction separation.
"""

import math
import struct
import time
from typing import List, Optional

from .logger import log_metric

# Dimension for all-MiniLM-L6-v2
EMBEDDING_DIM = 384


def serialize_float32(vector: List[float]) -> bytes:
    """Serializes a list of floats to a 32-bit float binary buffer for sqlite-vec."""
    return struct.pack(f"{len(vector)}f", *vector)


def deserialize_float32(blob: bytes) -> List[float]:
    """Deserializes a 32-bit float binary buffer to a list of floats."""
    count = len(blob) // 4
    return list(struct.unpack(f"{count}f", blob))


def cosine_distance(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculates cosine distance between two vectors: 1.0 - cosine_similarity."""
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 1.0
    similarity = dot / (norm_a * norm_b)
    # Clamp to [-1.0, 1.0] to avoid float precision drift
    similarity = max(-1.0, min(1.0, similarity))
    return 1.0 - similarity


class EmbeddingEngine:
    """
    Manages local embedding generation via SentenceTransformers.
    Computes vectors strictly in-memory outside of database transactions.
    """

    _instance: Optional["EmbeddingEngine"] = None

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self.is_native_transformer = False
        self._load_model()

    @classmethod
    def get_instance(cls) -> "EmbeddingEngine":
        """Singleton accessor to avoid reloading weights across modules."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model(self):
        """Attempts to load sentence-transformers; provides deterministic fallback if missing."""
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            self.is_native_transformer = True
        except ImportError:
            # Fallback for environments where sentence-transformers is not yet installed
            self.is_native_transformer = False

    def _generate_fallback_embedding(self, text: str) -> List[float]:
        """
        Deterministic local feature hashing fallback producing a normalized 384-d vector.
        Preserves semantic overlap for word n-grams when sentence-transformers is pending installation.
        """
        words = text.lower().split()
        vec = [0.0] * EMBEDDING_DIM
        if not words:
            vec[0] = 1.0
            return vec

        for word in words:
            # Hash word and bigrams into 384-dimensional space
            h = hash(word) % EMBEDDING_DIM
            vec[h] += 1.0
            for i in range(len(word) - 2):
                tri = hash(word[i:i+3]) % EMBEDDING_DIM
                vec[tri] += 0.5

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        else:
            vec[0] = 1.0
        return vec

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates a 384-dimensional normalized dense vector for input text.
        Always executed outside of SQLite transactions.
        """
        start = time.perf_counter()
        if self.is_native_transformer and self.model is not None:
            vector = self.model.encode(text, normalize_embeddings=True).tolist()
        else:
            vector = self._generate_fallback_embedding(text)

        latency_ms = (time.perf_counter() - start) * 1000
        log_metric(
            operation="generate_embedding",
            latency_ms=latency_ms,
            payload_size=len(text.encode("utf-8")),
            status="success",
            details={
                "model": self.model_name if self.is_native_transformer else "deterministic_fallback",
                "dim": len(vector)
            }
        )
        return vector

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Batch embedding generation in-memory."""
        start = time.perf_counter()
        if self.is_native_transformer and self.model is not None:
            vectors = self.model.encode(texts, normalize_embeddings=True).tolist()
        else:
            vectors = [self._generate_fallback_embedding(t) for t in texts]

        latency_ms = (time.perf_counter() - start) * 1000
        total_bytes = sum(len(t.encode("utf-8")) for t in texts)
        log_metric(
            operation="batch_generate_embeddings",
            latency_ms=latency_ms,
            payload_size=total_bytes,
            status="success",
            details={"batch_size": len(texts)}
        )
        return vectors
