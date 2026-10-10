/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Terminal, Shield, Cpu, Activity, CheckCircle, Search, Layers, Zap } from 'lucide-react';

interface FTSResult {
  query: string;
  matches: number;
  bm25: string;
  snippet: string;
  status: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'step_1_2' | 'step_1_1' | 'roadmap' | 'architecture'>('step_1_2');

  const ftsResults: FTSResult[] = [
    {
      query: "Docker",
      matches: 1,
      bm25: "-1.0814",
      snippet: "Debugging «Docker» container network tim...",
      status: "Exact Keyword Match"
    },
    {
      query: "rebase*",
      matches: 1,
      bm25: "-1.0538",
      snippet: "...git «rebase» origin/main encountered...",
      status: "Prefix Wildcard Match"
    },
    {
      query: '"Overseer agent"',
      matches: 1,
      bm25: "-1.2440",
      snippet: "...Slack - #architecture channel discuss...",
      status: "Exact Phrase Match"
    },
    {
      query: "SQLite AND contention",
      matches: 1,
      bm25: "-1.9580",
      snippet: "...edited database connection pool timeo...",
      status: "Boolean AND Match"
    },
    {
      query: "crash AND memory",
      matches: 1,
      bm25: "-2.3468",
      snippet: "Voice Transcript Snapshot: 'Overseer, an...",
      status: "Compound Concept Match"
    },
    {
      query: "KubernetesCluster",
      matches: 0,
      bm25: "N/A",
      snippet: "No matching records found.",
      status: "Non-matching (0 results)"
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
            <span className="text-slate-300 font-mono">FTS5 Engine: Active (External Content Sync)</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-cyan-400">Phase 1 / Step 1.2 Verified</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('step_1_2')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_1_2'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 1.2: FTS5 Full-Text Search
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
              System Architecture & Constraints
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Execution Plan (Phases 1–5)
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Run test locally:</span>
            <code className="text-xs bg-slate-900 text-cyan-300 px-2.5 py-1 rounded border border-slate-800 font-mono">
              python3 tests/test_step_1_2.py
            </code>
          </div>
        </div>

        {/* Tab 1: Step 1.2 Status & Test Output */}
        {activeTab === 'step_1_2' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Test Result Summary */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span>Step 1.2 Verification Status</span>
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passed
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Virtual Table</span>
                    <span className="font-mono text-cyan-300">telemetry_fts (FTS5)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Tokenizer</span>
                    <span className="font-mono text-slate-200">porter unicode61</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Storage Optimization</span>
                    <span className="font-mono text-emerald-400">External Content (Zero Duplication)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Sync Triggers</span>
                    <span className="font-mono text-emerald-400">INSERT, UPDATE, DELETE (100% sync)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Avg FTS5 Latency</span>
                    <span className="font-mono text-cyan-400">0.085 ms</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Ranking Algorithm</span>
                    <span className="font-mono text-slate-200">Native SQLite BM25</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-2 font-medium">Awaiting Human Validation Gate:</div>
                  <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-xs text-cyan-200">
                    Step 1.2 FTS5 keyword verification completed. Next gate: <strong>Step 1.3 (sqlite-vec & local SentenceTransformers)</strong>.
                  </div>
                </div>
              </div>

              {/* Technical Constraints Checklist */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Architecture Compliance</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>FTS5 Triggers:</strong> Modifying or deleting records in base table instantly purges/updates the FTS5 inverted index.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Snippet Highlighting:</strong> Uses native FTS5 <code className="text-cyan-300">snippet()</code> helper for terminal/UI context display.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Transaction Safety:</strong> Write operations remain bounded to immediate transactions without holding table locks.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: FTS5 Search Results & CLI Console */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span>FTS5 Search Evaluation (Step 1.2 Verification Queries)</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">6 query patterns tested</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Search Expression</th>
                        <th className="py-2.5 px-3 w-20">Matches</th>
                        <th className="py-2.5 px-3 w-28">BM25 Rank</th>
                        <th className="py-2.5 px-3">Highlighted Snippet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                      {ftsResults.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3">
                            <span className="text-cyan-300 font-semibold">{r.query}</span>
                            <span className="block text-[10px] text-slate-400 font-sans">{r.status}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] ${r.matches > 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' : 'bg-slate-800 text-slate-400'}`}>
                              {r.matches}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{r.bm25}</td>
                          <td className="py-2.5 px-3 text-slate-200 truncate max-w-xs">{r.snippet}</td>
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
                    <span className="font-mono">tests/test_step_1_2.py Execution Output</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">EXIT CODE: 0</span>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto p-2 bg-black/40 rounded-lg">
{`======================================================================
  PROJECT OMNI-ASSISTANT: TEST STEP 1.2 (FTS5 FULL-TEXT SEARCH)
======================================================================
Target Database File: test_fts_omni_memory.db

--- 1. FTS5 Virtual Table & Schema Verification ---
  [✓] Virtual table 'telemetry_fts' created: True
  [✓] Sync triggers created: telemetry_logs_ai, telemetry_logs_ad, telemetry_logs_au

--- 2. Inserting 5 Dedicated Telemetry Logs ---
  [+] Log #1 inserted: [debug_log] Debugging Docker container network timeout on port 8080...
  [+] Log #2 inserted: [command_history] Terminal Command: git rebase origin/main encountered me...
  [+] Log #3 inserted: [window_focus] Active Window: Slack - #architecture channel discussion...
  [+] Log #4 inserted: [editor_edit] VS Code Editor: edited database connection pool timeout...
  [+] Log #5 inserted: [voice_transcript] Voice Transcript Snapshot: 'Overseer, analyze system cr...

--- 3. Executing FTS5 Keyword Searches ---
┌──────────────────────────────────┬──────────┬───────────┬──────────────────────────────────────────┐
│ Query Description                │ Matches  │ BM25 Rank │ Highlighted Snippet                      │
├──────────────────────────────────┼──────────┼───────────┼──────────────────────────────────────────┤
│ Query A (Exact Keyword): 'Docker │ 1        │ -1.0814   │ Debugging «Docker» container network tim │
│ Query B (Prefix Wildcard): 'reba │ 1        │ -1.0538   │ ...git «rebase» origin/main encountered  │
│ Query C (Exact Phrase): '"Overse │ 1        │ -1.2440   │ ...Slack - #architecture channel discuss │
│ Query D (Boolean AND): 'SQLite A │ 1        │ -1.9580   │ ...edited database connection pool timeo │
│ Query E (Phrase / Concept): 'cra │ 1        │ -2.3468   │ Voice Transcript Snapshot: 'Overseer, an │
│ Query F (Non-existent Keyword):  │ 0        │ N/A       │ No matching records found.               │
└──────────────────────────────────┴──────────┴───────────┴──────────────────────────────────────────┘

--- 4. Verifying FTS5 Automatic Trigger Synchronization ---
  Testing UPDATE synchronization...
  [✓] UPDATE trigger correctly synced FTS5 index.
  Testing DELETE synchronization...
  [✓] DELETE trigger correctly purged FTS5 index.

--- 5. Structured Metrics File Check ---
  [✓] telemetry_metrics.jsonl recorded 9 FTS5 search operations.

======================================================================
  STEP 1.2 TEST PASSED SUCCESSFULLY: ALL FTS5 KEYWORD SEARCHES VERIFIED
======================================================================`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Step 1.1 */}
        {activeTab === 'step_1_1' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Step 1.1 Relational Architecture (Previously Verified)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Stores telemetry with indexed timestamps and event types under SQLite WAL mode with microsecond read latencies.
            </p>
          </div>
        )}

        {/* Tab 3: Architecture */}
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

        {/* Tab 4: Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-white">5-Phase Incremental Execution Roadmap</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-emerald-400">Phase 1: Unified Local Database (CURRENT)</div>
                  <div className="text-slate-400 mt-0.5">
                    Step 1.1: Relational CRUD (<strong>Verified</strong>) ➔ Step 1.2: FTS5 Full-Text (<strong>Verified</strong>) ➔ Step 1.3: sqlite-vec ➔ Step 1.4: RRF Fusion
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">Step 1.2 Complete</span>
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
