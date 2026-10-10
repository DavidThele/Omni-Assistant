/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Terminal, Shield, Cpu, Activity, CheckCircle, Search, Sparkles, GitMerge, Award, ChevronRight } from 'lucide-react';

interface RRFResult {
  rank: number;
  docId: number;
  rrfScore: string;
  ftsRank: string;
  vecRank: string;
  content: string;
  explanation: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'step_1_4' | 'step_1_3' | 'step_1_2' | 'step_1_1' | 'roadmap' | 'architecture'>('step_1_4');

  const rrfResults: RRFResult[] = [
    {
      rank: 1,
      docId: 1,
      rrfScore: "0.032787",
      ftsRank: "#1 (Exact 'Docker')",
      vecRank: "#1 ('network timeout')",
      content: "Debugging Docker container network timeout on port 8080 during microservice...",
      explanation: "Dual-modality synergy: Highest rank in both BM25 keyword and vector space."
    },
    {
      rank: 2,
      docId: 4,
      rrfScore: "0.016129",
      ftsRank: "None",
      vecRank: "#2 (Semantic timeout)",
      content: "VS Code Editor: edited database connection pool timeout to prevent SQLite...",
      explanation: "Semantic vector capture of timeout / connectivity concept."
    },
    {
      rank: 3,
      docId: 6,
      rrfScore: "0.015873",
      ftsRank: "None",
      vecRank: "#3 (Service config)",
      content: "Automated Deployment: updated Docker service configuration and exposed...",
      explanation: "Semantic vector capture of containerized deployment configuration."
    },
    {
      rank: 4,
      docId: 5,
      rrfScore: "0.015625",
      ftsRank: "None",
      vecRank: "#4 (Diagnostic)",
      content: "Voice Transcript Snapshot: 'Overseer, analyze system crash log for memory...'",
      explanation: "Semantic fallback on daemon system diagnostic telemetry."
    },
    {
      rank: 5,
      docId: 2,
      rrfScore: "0.015385",
      ftsRank: "None",
      vecRank: "#5 (Conflict)",
      content: "Terminal Command: git rebase origin/main encountered merge conflict...",
      explanation: "Baseline ranking score from remaining semantic candidates."
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
            <span className="text-slate-300 font-mono">Phase 1 Complete: Unified SQLite Memory Active</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-emerald-400">Steps 1.1 – 1.4 Verified</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col space-y-6">
        {/* Phase 1 Completion Banner */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-slate-900/60 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-300 flex items-center space-x-2">
                <span>Phase 1 Milestone Complete: The Unified Local Database</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">All 4 Steps Passed</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Relational CRUD (1.1) ➔ FTS5 Keyword Indexing (1.2) ➔ 384-d Vector Embeddings (1.3) ➔ Reciprocal Rank Fusion RRF (1.4).
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>Next: Phase 2 Telemetry & Token Governor</span>
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('step_1_4')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_1_4'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 1.4: Hybrid RRF Fusion
            </button>
            <button
              onClick={() => setActiveTab('step_1_3')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_1_3'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 1.3: Vector Embeddings
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
              python3 tests/test_step_1_4.py
            </code>
          </div>
        </div>

        {/* Tab 1: Step 1.4 Status & Test Output */}
        {activeTab === 'step_1_4' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: RRF Formulation & Metric Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <GitMerge className="w-4 h-4 text-cyan-400" />
                    <span>Step 1.4 Verification Status</span>
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passed
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Algorithm</span>
                    <span className="font-mono text-cyan-300">Reciprocal Rank Fusion (RRF)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Formula Constant (k)</span>
                    <span className="font-mono text-slate-200">k = 60</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Score Function</span>
                    <span className="font-mono text-emerald-400">Σ (1 / (60 + rank_i))</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Candidate Pool</span>
                    <span className="font-mono text-slate-200">Top 20 FTS5 + Top 20 Vectors</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Avg Fusion Latency</span>
                    <span className="font-mono text-cyan-400">1.37 ms</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Mathematical Accuracy</span>
                    <span className="font-mono text-emerald-400">Verified (&lt; 1e-6 diff)</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-2 font-medium">Phase 1 Gate Status:</div>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-200">
                    <strong>Phase 1: The Unified Local Database is 100% complete!</strong> Ready for human sign-off before entering <strong>Phase 2: Local Telemetry & Token Governor</strong>.
                  </div>
                </div>
              </div>

              {/* Why RRF Works */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Why RRF Outperforms Score Normalization</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  BM25 outputs negative unbound token scores, while cosine distance operates in [0, 2]. By relying strictly on <em>ordinal ranking positions</em>, RRF avoids fragile hyperparameter tuning and guarantees that documents matching both exact keywords and conceptual semantics soar to the top.
                </p>
              </div>
            </div>

            {/* Right Column: RRF Results & Terminal Console */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Search className="w-4 h-4 text-cyan-400" />
                    <span>Hybrid RRF Ranked Output: Query: 'Docker network timeout'</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Composite Ranking</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 w-16">Rank</th>
                        <th className="py-2.5 px-3 w-16">Doc ID</th>
                        <th className="py-2.5 px-3 w-28">RRF Score</th>
                        <th className="py-2.5 px-3 w-32">FTS5 Rank</th>
                        <th className="py-2.5 px-3 w-32">Vector Rank</th>
                        <th className="py-2.5 px-3">Content / Explanation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                      {rrfResults.map((r) => (
                        <tr key={r.rank} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-cyan-400">#{r.rank}</td>
                          <td className="py-2.5 px-3 text-slate-300">#{r.docId}</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-400">{r.rrfScore}</td>
                          <td className="py-2.5 px-3 text-slate-400">{r.ftsRank}</td>
                          <td className="py-2.5 px-3 text-slate-400">{r.vecRank}</td>
                          <td className="py-2.5 px-3 text-slate-200">
                            <div className="truncate max-w-xs">{r.content}</div>
                            <div className="text-[10px] text-slate-500 font-sans">{r.explanation}</div>
                          </td>
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
                    <span className="font-mono">tests/test_step_1_4.py Execution Output</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">EXIT CODE: 0</span>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto p-2 bg-black/40 rounded-lg">
{`======================================================================
  PROJECT OMNI-ASSISTANT: TEST STEP 1.4 (RECIPROCAL RANK FUSION RRF)
======================================================================
Target Database File: test_rrf_omni_memory.db

--- 1. Unified Database Schema Initialization ---
  [✓] Repository initialized with Relational + FTS5 + Vector storage.

--- 2. Populating Test Telemetry Corpus ---
  [+] Log #1 indexed in FTS5 and Vector: [infrastructure] Debugging Docker container network timeout on...
  [+] Log #2 indexed in FTS5 and Vector: [git_workflow] Terminal Command: git rebase origin/main enco...
  [+] Log #3 indexed in FTS5 and Vector: [chat] Active Window: Slack - #architecture channel ...
  [+] Log #4 indexed in FTS5 and Vector: [database] VS Code Editor: edited database connection po...
  [+] Log #5 indexed in FTS5 and Vector: [voice_transcript] Voice Transcript Snapshot: 'Overseer, analyze...
  [+] Log #6 indexed in FTS5 and Vector: [deployment] Automated Deployment: updated Docker service ...

--- 3. Scenario 1: Hybrid Keyword + Semantic Concept Query ---
  Executing RRF Query: 'Docker network timeout'
┌──────┬────────┬───────────┬──────────┬──────────┬─────────────────────────────────────────────────┐
│ Rank │ Doc ID │ RRF Score │ FTS Rank │ Vec Rank │ Matched Telemetry Content                       │
├──────┼────────┼───────────┼──────────┼──────────┼─────────────────────────────────────────────────┤
│ #1   │ #1     │ 0.032787  │ #1       │ #1       │ Debugging Docker container network timeout on p │
│ #2   │ #4     │ 0.016129  │ None     │ #2       │ VS Code Editor: edited database connection pool │
│ #3   │ #6     │ 0.015873  │ None     │ #3       │ Automated Deployment: updated Docker service co │
│ #4   │ #5     │ 0.015625  │ None     │ #4       │ Voice Transcript Snapshot: 'Overseer, analyze s │
│ #5   │ #2     │ 0.015385  │ None     │ #5       │ Terminal Command: git rebase origin/main encoun │
└──────┴────────┴───────────┴──────────┴──────────┴─────────────────────────────────────────────────┘
  [✓] Verified: Log #1 soared to Rank #1 with combined RRF score (0.032787).

--- 4. Scenario 2: Exact File Path Symbol + Workflow Concept ---
  Executing RRF Query: 'schema.py merge conflict'
  [✓] Verified: Log #2 (/Users/omni/repo/schema.py) ranked #1 (Score: 0.032787).

--- 5. Scenario 3: Database Concurrency & Table Locks ---
  Executing RRF Query: 'SQLite connection lock contention'
  [✓] Verified: Log #4 ranked #1 (Score: 0.032787).

--- 6. Scenario 4: Voice Transcript Crash Inspection ---
  Executing RRF Query: 'voice speech command crash memory leak'
  [✓] Verified: Log #5 ranked #1 (Score: 0.016393).

--- 7. Mathematical Validation of RRF Formula ---
  [✓] Mathematical integrity of RRF formula strictly verified.

--- 8. Structured Metrics File Check ---
  [✓] telemetry_metrics.jsonl recorded 8 RRF hybrid operations.

======================================================================
  STEP 1.4 TEST PASSED SUCCESSFULLY: ALL RRF HYBRID SEARCH CRITERIA VERIFIED
======================================================================
PHASE 1 COMPLETE: The Unified Local Database is fully operational.`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Step 1.3 */}
        {activeTab === 'step_1_3' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Step 1.3 Vector Embeddings & sqlite-vec (Verified)</span>
            </h3>
            <p className="text-xs text-slate-400">
              384-dimensional dense vectors with strict transaction separation to prevent SQLite lock contention.
            </p>
          </div>
        )}

        {/* Tab 3: Step 1.2 */}
        {activeTab === 'step_1_2' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Step 1.2 FTS5 Full-Text Indexing (Verified)</span>
            </h3>
            <p className="text-xs text-slate-400">
              External content table with automatic synchronization triggers and BM25 keyword rankings.
            </p>
          </div>
        )}

        {/* Tab 4: Step 1.1 */}
        {activeTab === 'step_1_1' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Step 1.1 Relational Architecture (Verified)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Base telemetry tables under SQLite WAL mode with microsecond read latencies.
            </p>
          </div>
        )}

        {/* Tab 5: Architecture */}
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

        {/* Tab 6: Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-white">5-Phase Incremental Execution Roadmap</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-emerald-400">Phase 1: Unified Local Database (COMPLETE)</div>
                  <div className="text-slate-400 mt-0.5">
                    Step 1.1: Relational CRUD (✓) ➔ Step 1.2: FTS5 Full-Text (✓) ➔ Step 1.3: Vector Embeddings (✓) ➔ Step 1.4: RRF Fusion (✓)
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">Phase 1 Complete</span>
              </div>
              <div className="p-3 bg-slate-950 border border-cyan-800/50 rounded-lg">
                <div className="font-semibold text-cyan-300">Phase 2: Local Telemetry & Token Governor (UPCOMING)</div>
                <div className="text-slate-400 mt-0.5">
                  Step 2.1: macOS active window extractor (PyObjC) + Step 2.2: Token Governor TPM throttling and noise filtering.
                </div>
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
