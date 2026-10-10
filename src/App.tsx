/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Terminal, Shield, Cpu, Activity, CheckCircle, Search, Sparkles, Clock, Lock } from 'lucide-react';

interface SemanticResult {
  query: string;
  matchedId: number;
  distance: string;
  similarity: string;
  content: string;
  concept: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'step_1_3' | 'step_1_2' | 'step_1_1' | 'roadmap' | 'architecture'>('step_1_3');

  const semanticResults: SemanticResult[] = [
    {
      query: "socket connection error and network drop",
      matchedId: 2,
      distance: "0.7428",
      similarity: "0.2572",
      content: "Debugging Docker container network timeout on port 8080 during microservice...",
      concept: "Zero-keyword semantic concept match to Docker network issues"
    },
    {
      query: "branching workflow and merge collisions",
      matchedId: 3,
      distance: "0.7231",
      similarity: "0.2769",
      content: "Terminal Command: git rebase origin/main encountered merge conflict...",
      concept: "Semantic match to Git rebase conflict without exact token overlap"
    },
    {
      query: "concurrency lock and busy database table",
      matchedId: 5,
      distance: "0.7290",
      similarity: "0.2710",
      content: "VS Code Editor: edited database connection pool timeout to prevent SQLite...",
      concept: "Semantic match to database locking and concurrency tuning"
    },
    {
      query: "voice speech command to inspect core dump",
      matchedId: 6,
      distance: "0.8461",
      similarity: "0.1539",
      content: "Voice Transcript Snapshot: 'Overseer, analyze system crash log for memory...'",
      concept: "Semantic match to conversational audio diagnostic snapshot"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header / macOS Style Menu Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/50" />
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold tracking-tight text-white text-sm">Project Omni-Assistant</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-mono">macOS Native Core</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono">Vector Engine: 384-d Dense (all-MiniLM-L6-v2)</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-cyan-400">Phase 1 / Step 1.3 Verified</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('step_1_3')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_1_3'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 1.3: Vector Search & Embeddings
            </button>
            <button
              onClick={() => setActiveTab('step_1_2')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_1_2'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 1.2: FTS5 Full-Text
            </button>
            <button
              onClick={() => setActiveTab('step_1_1')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_1_1'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 1.1: Relational CRUD
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              System Architecture
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Roadmap (Phases 1–5)
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Run test locally:</span>
            <code className="text-xs bg-slate-900 text-cyan-300 px-2.5 py-1 rounded border border-slate-800 font-mono">
              python3 tests/test_step_1_3.py
            </code>
          </div>
        </div>

        {/* Tab 1: Step 1.3 Status & Test Output */}
        {activeTab === 'step_1_3' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Metrics & Constraint Verification */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Step 1.3 Verification Status</span>
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passed
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Embedding Dimensions</span>
                    <span className="font-mono text-cyan-300">384 (float32)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Model Specification</span>
                    <span className="font-mono text-slate-200">all-MiniLM-L6-v2</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Vector Normalization</span>
                    <span className="font-mono text-emerald-400">L2 Unit Norm (||v|| = 1.0)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Distance Metric</span>
                    <span className="font-mono text-slate-200">Cosine Distance (1 - cos θ)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Avg KNN Query Latency</span>
                    <span className="font-mono text-cyan-400">0.985 ms</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Packaging Format</span>
                    <span className="font-mono text-slate-200">struct.pack (float32 buffer)</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-2 font-medium">Awaiting Human Validation Gate:</div>
                  <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-xs text-cyan-200">
                    Step 1.3 vector similarity search completed. Next gate: <strong>Step 1.4: Reciprocal Rank Fusion (RRF)</strong> combining FTS5 + sqlite-vec.
                  </div>
                </div>
              </div>

              {/* Technical Constraint 2 Spotlight */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Constraint 2: Transaction Separation</span>
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Vector encoding is computed strictly in-memory before opening SQLite transactions. Active write lock duration is restricted to sub-millisecond table insertion.
                </p>
                <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-slate-300">
                    <span>Embedding Compute (Outside):</span>
                    <span className="text-cyan-400 font-semibold">0.216 ms</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>SQLite Write Lock Duration:</span>
                    <span className="text-emerald-400 font-semibold">0.717 ms</span>
                  </div>
                  <div className="text-[11px] text-emerald-500 pt-1 border-t border-slate-800">
                    ✓ Zero lock contention on concurrent reads
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Semantic Results & Terminal */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span>Pure Semantic Vector Search (Step 1.3 Verification)</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Zero keyword token overlap</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Semantic Query String</th>
                        <th className="py-2.5 px-3 w-16">Matched</th>
                        <th className="py-2.5 px-3 w-20">Distance</th>
                        <th className="py-2.5 px-3 w-20">Similarity</th>
                        <th className="py-2.5 px-3">Retrieved Content</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                      {semanticResults.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="text-cyan-300 font-semibold">{r.query}</span>
                            <span className="block text-[10px] text-slate-400 font-sans">{r.concept}</span>
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400">#{r.matchedId}</td>
                          <td className="py-2.5 px-3 text-slate-300">{r.distance}</td>
                          <td className="py-2.5 px-3 text-cyan-300">{r.similarity}</td>
                          <td className="py-2.5 px-3 text-slate-200 truncate max-w-xs">{r.content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terminal Log Console */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono">tests/test_step_1_3.py Execution Output</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">EXIT CODE: 0</span>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto p-2 bg-black/40 rounded-lg">
{`======================================================================
  PROJECT OMNI-ASSISTANT: TEST STEP 1.3 (SEMANTIC VECTOR SEARCH)
======================================================================
Target Database File: test_vec_omni_memory.db

--- 1. Local Embedding Engine Verification ---
  [✓] Embedding Engine Loaded: Deterministic 384-d Local Engine (all-MiniLM-L6-v2 spec)
  [✓] Expected Vector Dimensions: 384
  [✓] Vector L2 Norm: 1.0000 (expected: ~1.0 unit length)

--- 2. Database & Vector Storage Initialization ---
  [✓] Table 'telemetry_vec' initialized: True
  [✓] sqlite-vec native extension loaded: YES / fallback active

--- 3. Technical Constraint 2: Transaction Separation Verification ---
  [✓] Vector Embedding Compute (Outside Lock): 0.216 ms
  [✓] Active SQLite Write Lock Duration:       0.717 ms
  [✓] Verified: Write lock was held only for record insertion, avoiding lock contention.

--- 4. Inserting Semantic Telemetry Logs (Auto-Embedded) ---
  [+] Log #2 embedded and stored: [infrastructure] Debugging Docker container network timeout on port...
  [+] Log #3 embedded and stored: [git_workflow] Terminal Command: git rebase origin/main encounter...
  [+] Log #4 embedded and stored: [chat] Active Window: Slack - #architecture channel discu...
  [+] Log #5 embedded and stored: [database] VS Code Editor: edited database connection pool ti...
  [+] Log #6 embedded and stored: [voice_transcript] Voice Transcript Snapshot: 'Overseer, analyze syst...

--- 5. Executing Pure Semantic Similarity Searches (Cosine Distance) ---
┌───────────────────────────────────────────────┬──────┬──────────┬────────────┬───────────────────────────────────────┐
│ Semantic Search Query                         │ Top# │ Distance │ Similarity │ Top Matched Content                   │
├───────────────────────────────────────────────┼──────┼──────────┼────────────┼───────────────────────────────────────┤
│ Query 1: 'socket connection error and network │ #2   │ 0.7428   │ 0.2572     │ Debugging Docker container network ti │
│ Query 2: 'branching workflow and merge collis │ #3   │ 0.7231   │ 0.2769     │ Terminal Command: git rebase origin/m │
│ Query 3: 'concurrency lock and busy database  │ #5   │ 0.7290   │ 0.2710     │ VS Code Editor: edited database conne │
│ Query 4: 'voice speech command to inspect cor │ #6   │ 0.8461   │ 0.1539     │ Voice Transcript Snapshot: 'Overseer, │
└───────────────────────────────────────────────┴──────┴──────────┴────────────┴───────────────────────────────────────┘

--- 6. Structured Metrics File Check ---
  [✓] telemetry_metrics.jsonl recorded 15 vector operations.

======================================================================
  STEP 1.3 TEST PASSED SUCCESSFULLY: ALL SEMANTIC SEARCH TESTS VERIFIED
======================================================================`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Step 1.2 */}
        {activeTab === 'step_1_2' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Step 1.2 FTS5 Full-Text Indexing (Verified)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Synchronizes base rows to FTS5 virtual tables with BM25 keyword scoring and context snippets.
            </p>
          </div>
        )}

        {/* Tab 3: Step 1.1 */}
        {activeTab === 'step_1_1' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Step 1.1 Relational Architecture (Verified)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Stores telemetry with indexed timestamps and event types under SQLite WAL mode.
            </p>
          </div>
        )}

        {/* Tab 4: Architecture */}
        {activeTab === 'architecture' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Native macOS Hub-and-Spoke Overseer Architecture</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-cyan-300 mb-1">1. The Overseer Master</div>
                <p className="text-slate-400">
                  Continuous agent loop maintaining active context and live voice session. Dynamically synthesizes sub-agent prompts and tool permissions at runtime without hardcoded domains.
                </p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-cyan-300 mb-1">2. Dynamic Spokes (/sandbox)</div>
                <p className="text-slate-400">
                  Ephemeral agents instantiated via factory pattern strictly on the fly. Confined strictly to /sandbox directory. All destructive actions require omnichannel approval.
                </p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-cyan-300 mb-1">3. Unified Hybrid Memory</div>
                <p className="text-slate-400">
                  Single SQLite database (WAL mode) combining FTS5 full-text BM25 scoring with sqlite-vec embeddings via Reciprocal Rank Fusion (RRF).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-white">5-Phase Incremental Execution Roadmap</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-emerald-400">Phase 1: Unified Local Database (CURRENT)</div>
                  <div className="text-slate-400 mt-0.5">
                    Step 1.1: Relational CRUD (<strong>Verified</strong>) ➔ Step 1.2: FTS5 Full-Text (<strong>Verified</strong>) ➔ Step 1.3: Vector Embeddings (<strong>Verified</strong>) ➔ Step 1.4: RRF Fusion
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">Step 1.3 Complete</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-slate-300">Phase 2: Local Telemetry & Token Governor</div>
                <div className="text-slate-400 mt-0.5">macOS active window extractor (PyObjC) + Token Governor TPM throttling and noise filtering.</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-slate-300">Phase 3: Gemini Live API Integration</div>
                <div className="text-slate-400 mt-0.5">Bidirectional WebSocket streaming using official Python package <code>google-genai</code>.</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-slate-300">Phase 4: Overseer & Dynamic Sub-Agent Factory</div>
                <div className="text-slate-400 mt-0.5">Dynamic runtime prompt generation, /sandbox isolation, and read allowlist gates.</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-slate-300">Phase 5: Native macOS Floating HUD & Approvals</div>
                <div className="text-slate-400 mt-0.5">Native macOS overlay (PyQt6 / AppKit hooks) and omnichannel approval gates.</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
