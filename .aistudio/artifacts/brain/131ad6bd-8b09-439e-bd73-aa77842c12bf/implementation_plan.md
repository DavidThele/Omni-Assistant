# Project Omni-Assistant: Native macOS Architecture & Phase 1 Execution Plan

An omnipresent, context-aware operating system orchestrator for macOS built strictly with native Python, utilizing local sensory telemetry, dynamic factory-pattern sub-agent provisioning, and low-latency Gemini Live API streaming bounded by local privacy and memory.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Revised with your three required technical constraints. Execution strictly follows the incremental verification plan, beginning with Phase 1, Step 1.1 upon approval.

- **Confirmed Decision 1 (Execution Target & Runtime)**: Strictly native macOS Python scripts (`python3` with virtual environment). No web application, web dashboard, or Node.js runtime.
- **Confirmed Technical Constraint 1 (SQLite Extension Loading)**: Implement SQLite connection handling with `pysqlite3-binary` import fallback (`import pysqlite3 as sqlite3`) to ensure `db.enable_load_extension(True)` works reliably on macOS default Python builds without dynamic link errors when loading `sqlite-vec`.
- **Confirmed Technical Constraint 2 (Transaction Separation & Lock Prevention)**: Compute all dense vector embeddings (`sentence-transformers`) strictly **outside** of active SQLite write transactions. The workflow enforces: (1) calculate vector embeddings in memory, (2) open short-lived transaction, (3) execute atomic write/insert, (4) commit immediately.
- **Confirmed Technical Constraint 3 (Python SDK for Phase 3)**: Use the official Python package `google-genai` (`from google import genai`) for the Gemini Live API bidirectional streaming over WebSockets, with zero JavaScript or npm dependencies.
- **Confirmed Decision 4 (UI Deferred to Phase 5)**: Visual interface (floating macOS HUD using PyQt6 / native window hooks) is deferred to Phase 5. Phase 1 focuses exclusively on the local database and retrieval engine.
- **Confirmed Decision 5 (Incremental Validation Cadence)**: Strict phase-and-step gated execution. Every step includes an interactive verification script (`test_step_1_1.py`, etc.) that logs output to terminal and structured metrics before proceeding to the subsequent step.

---

## 1. Overview & Core Concept

- **What It Does**: Project Omni-Assistant observes user activity across macOS (window titles, accessibility tree, command history, file changes), passes it through a local noise filter and token governor, and feeds synthesized context to an Overseer agent. The Overseer dynamically provisions ephemeral, task-specific sub-agents with sandboxed tool access (inside `/sandbox`), completely on the fly without hardcoded agent types.
- **Target Persona & Context**: macOS power users and developers seeking proactive, hands-free context automation and live conversational assistance with zero token waste and guaranteed local privacy.
- **Key Value**: Real-time context awareness without cognitive overload; seamless dynamic tool generation; deterministic sandboxed safety with human-in-the-loop gates; and zero-cost local memory retrieval combining exact keyword search with dense semantic vectors.

---

## 2. User Experience & Visual Design

- **Immediate Focus (Phases 1–4)**: Terminal-native, developer-grade CLI logging and verification. Each phase and step outputs clear, structured status blocks with timings, query latency, schema dumps, and ranked search scores.
- **Deferred Phase 5 (Native Floating HUD)**:
  - *Platform*: Native macOS floating overlay (via PyQt6 with borderless translucent window flags `Qt.WindowStaysOnTopHint` and Apple Vibrancy effects, or native PyObjC/AppKit).
  - *Aesthetic*: Minimalist macOS Dark Mode glassmorphism, accentuating active sub-agent states, pending execution stage cards, and live voice waveform activity.
  - *Interactions*: Omnichannel approval gates (Karabiner-Elements global hotkeys, floating action buttons, and voice approval).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: SQLite + FTS5 + `sqlite-vec` via `pysqlite3-binary`**
  - *Chosen Approach*: Single unified SQLite database file (`omni_memory.db`) housing relational logs, FTS5 virtual table, and `sqlite-vec` vector table. Extension loading is safeguarded via `pysqlite3-binary` so `enable_load_extension(True)` is guaranteed on macOS.
  - *Why*: Eliminates macOS default Python restrictions where extension loading is often disabled in system-bundled `sqlite3`.

- **Decision 2: Strict Isolation of Embedding Computation from Write Transactions**
  - *Chosen Approach*: The embedding generation pipeline computes embeddings asynchronously or in-memory prior to acquiring any database lock:
    ```
    Raw Content ──► SentenceTransformer.encode() ──► Embeddings in Memory
                                                            │
    BEGIN TRANSACTION ◄─────────────────────────────────────┘
    INSERT INTO telemetry_logs ...
    INSERT INTO telemetry_vec ...
    COMMIT
    ```
  - *Why*: Sentence transformer encoding takes 10–50ms depending on CPU load. Holding an open SQLite transaction during this computation would block concurrent readers/writers and cause database lock contention.

- **Decision 3: Reciprocal Rank Fusion (RRF) for Hybrid Retrieval**
  - *Chosen Approach*: Standard RRF algorithm `RRF_Score(d) = sum(1 / (k + rank_i(d)))` with constant `k = 60` merging ranks from FTS5 BM25 scoring and `sqlite-vec` cosine distance.
  - *Why*: Keyword search catches exact symbols (variable names, error codes, file paths), while vector search catches conceptual intent. RRF normalizes distinct score scales without fragile heuristic weight tuning.

- **Decision 4: "Loud and Brittle" Fail-Fast Philosophy**
  - *Chosen Approach*: Explicit assertion checks and early crashes (`logs/system_crash.log`) with full stack traces during development instead of silent error recovery.
  - *Why*: Prevents corrupted context, hidden telemetry drops, or silent database desync from compounding into downstream agent misbehavior.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        macOS Host Environment                          │
└──────┬────────────────────────────────┬────────────────────────┬───────┘
       │                                │                        │
       ▼                                ▼                        ▼
┌──────────────┐                 ┌──────────────┐         ┌──────────────┐
│  Continuous  │                 │  On-Demand   │         │ Token Gov.   │
│  Telemetry   │                 │   Snapshot   │         │ (TPM Budget) │
└──────┬───────┘                 └──────┬───────┘         └──────┬───────┘
       │                                │                        │
       └────────────────►┌──────────────▼─────────────┐◄─────────┘
                         │   Local Telemetry Parser   │
                         │ (SentenceTransformers/BGE) │
                         └──────────────┬─────────────┘
                                        │ Dense JSON Summaries
                                        ▼
                         ┌────────────────────────────┐
                         │   Overseer Orchestrator    │
                         │   (google-genai Python)    │
                         └──────┬──────────────┬──────┘
                                │              │
            Spawns Ephemeral    │              │ Queries Unified Memory
            Sub-Agents On-Demand│              │
                                ▼              ▼
                 ┌────────────────────┐  ┌───────────────────────────────┐
                 │ Dynamic Sub-Agent  │  │ Unified Local DB (SQLite)     │
                 │      Factory       │  │ (pysqlite3-binary + WAL)      │
                 │ ├─ Prompt Synth.   │  │ ├─ Relational Events Table    │
                 │ ├─ Tool Allocator  │  │ ├─ FTS5 Full-Text Index       │
                 │ └─ Sandbox Bounds  │  │ ├─ sqlite-vec Virtual Table   │
                 └─────────┬──────────┘  │ └─ RRF Hybrid Fusion Engine   │
                           │             └───────────────────────────────┘
                           ▼
                 ┌────────────────────┐
                 │ Native Sandbox     │
                 │  (/sandbox only)   │
                 │ ├─ Read Allowlist  │
                 │ └─ Approval Gates  │
                 └────────────────────┘
```

### Database Schema Strategy (`omni_memory.db`)

1. **`telemetry_logs`**:
   - `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - `timestamp`: `DATETIME DEFAULT CURRENT_TIMESTAMP`
   - `file_path`: `TEXT`
   - `event_type`: `TEXT` (e.g., `window_focus`, `command_run`, `transcript`)
   - `content`: `TEXT NOT NULL`
   - `metadata`: `TEXT` (JSON-encoded attributes)

2. **`telemetry_fts` (FTS5 Virtual Table)**:
   - `content`: Content for full-text indexing
   - `file_path`: Content for path indexing
   - External content mapping to `telemetry_logs(id)` with synchronization triggers.

3. **`telemetry_vec` (`sqlite-vec` Virtual Table)**:
   - `rowid`: Integer rowid matching `telemetry_logs(id)`
   - `embedding`: `float[384]` vector using `all-MiniLM-L6-v2`.

---

## 5. Incremental Build & Testing Roadmap

### **Phase 1: The Unified Local Database (CURRENT FOCUS)**
- **Step 1.1: Relational SQLite Schema & Baseline CRUD**
  - Implement `src/db/connection.py` (with `pysqlite3-binary` detection and WAL mode) and `src/db/schema.py`.
  - Deliverable: `tests/test_step_1_1.py` verifying table creation, schema constraints, record insertion, reading back, and metric logging in `logs/telemetry_metrics.jsonl`.
  - **Decision Gate**: Human validation and verification output before Step 1.2.
- **Step 1.2: FTS5 Full-Text Search Integration**
  - Configure SQLite FTS5 extension and automatic sync triggers between `telemetry_logs` and `telemetry_fts`.
  - Deliverable: `tests/test_step_1_2.py` inserting multi-scenario sample logs, executing BM25 keyword searches (wildcards, phrases, boolean operators), and validating result sets.
- **Step 1.3: `sqlite-vec` & Local SentenceTransformers Embeddings**
  - Load `sqlite-vec` extension and wire `all-MiniLM-L6-v2` embedding generation.
  - Implement strict transaction separation (embeddings calculated in memory before opening write transactions).
  - Deliverable: `tests/test_step_1_3.py` converting telemetry strings to 384-d vectors, inserting into vector table, and running pure cosine distance KNN queries.
- **Step 1.4: Reciprocal Rank Fusion (RRF) Hybrid Pipeline**
  - Implement RRF merging logic combining BM25 keyword ranks and vector similarity ranks.
  - Deliverable: `tests/test_step_1_4.py` testing edge cases (exact path matches vs. fuzzy semantic queries) and displaying ranked scoring tables.

### **Phase 2: Local Telemetry & Token Governor**
- **Step 2.1**: macOS active window extractor & accessibility tree parser via PyObjC / `osascript`.
- **Step 2.2**: Local Noise Filter & Token Governor TPM tracking logic with batch throttling.

### **Phase 3: Gemini Live API Integration (Python `google-genai`)**
- **Step 3.1**: WebSocket connection to Gemini Live API using official Python package `google-genai` (`genai.Client`).
- **Step 3.2**: Bidirectional audio streaming with Voice Activity Detection (VAD) and barge-in.

### **Phase 4: Overseer & Dynamic Sub-Agent Factory**
- **Step 4.1**: Dynamic prompt synthesis and ephemeral sub-agent factory based on real-time telemetry.
- **Step 4.2**: Native sandbox executor bounded to `/sandbox` with read allowlist and destructive modifier intercepts.

### **Phase 5: Native macOS UI & Omnichannel Approval**
- **Step 5.1**: Floating HUD overlay (PyQt6 / native hooks), global hotkey listeners, and execution staging gates.
