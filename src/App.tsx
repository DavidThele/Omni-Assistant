/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Terminal, Shield, Cpu, Activity, CheckCircle, FileText, ArrowRight, Play, RefreshCw } from 'lucide-react';

interface LogItem {
  id: number;
  timestamp: string;
  eventType: string;
  filePath: string;
  content: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'step_1_1' | 'roadmap' | 'architecture'>('step_1_1');
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success'>('success');

  const dummyLogs: LogItem[] = [
    {
      id: 4,
      timestamp: '2026-10-10 17:56:51',
      eventType: 'voice_transcript',
      filePath: 'N/A',
      content: "Voice Transcript Snapshot: 'Overseer, show me the recent test results.'"
    },
    {
      id: 3,
      timestamp: '2026-10-10 17:56:51',
      eventType: 'filesystem_change',
      filePath: '/Users/omni/Developer/OmniAssistant/src/db/schema.py',
      content: 'File Modified: /Users/omni/Developer/OmniAssistant/src/db/schema.py (+24 lines)'
    },
    {
      id: 2,
      timestamp: '2026-10-10 17:56:51',
      eventType: 'command_history',
      filePath: '/Users/omni/Developer/OmniAssistant',
      content: 'Terminal Command Executed: git status -s'
    },
    {
      id: 1,
      timestamp: '2026-10-10 17:56:51',
      eventType: 'window_focus',
      filePath: '/Users/omni/Developer/OmniAssistant/src/overseer.py',
      content: 'Active Window: Terminal - python3 overseer.py (PID: 4821)'
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
            <span className="text-slate-300 font-mono">Engine: Python 3.10 + SQLite WAL</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-slate-400">Phase 1 / Step 1.1</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('step_1_1')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_1_1'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 1.1: Local Database Validation
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
              python3 tests/test_step_1_1.py
            </code>
          </div>
        </div>

        {/* Tab 1: Step 1.1 Status & Test Output */}
        {activeTab === 'step_1_1' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Test Result Summary */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>Step 1.1 Verification Status</span>
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passed
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Target DB</span>
                    <span className="font-mono text-slate-200">omni_memory.db</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Journal Mode</span>
                    <span className="font-mono text-emerald-400">WAL (PRAGMA 1)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Extension Loading</span>
                    <span className="font-mono text-emerald-400">enable_load_extension: True</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Schema Initialized</span>
                    <span className="font-mono text-slate-200">telemetry_logs + 2 Indices</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Avg Read Latency</span>
                    <span className="font-mono text-cyan-400">0.046 ms</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Fail-Safe Logging</span>
                    <span className="font-mono text-slate-200">logs/system_crash.log</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-2 font-medium">Awaiting Human Validation Gate:</div>
                  <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-lg text-xs text-cyan-200">
                    Step 1.1 relational CRUD verification completed. Next gate: <strong>Step 1.2 (FTS5 Full-Text Search)</strong>.
                  </div>
                </div>
              </div>

              {/* Technical Constraints Checklist */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>3 Technical Constraints</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>SQLite Extensions:</strong> <code className="text-cyan-300">pysqlite3-binary</code> fallback enabled for macOS extension loading.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Transaction Separation:</strong> Write locks isolated to microsecond inserts; embeddings calculated outside write transactions.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Python SDK:</strong> Phase 3 configured for official <code className="text-cyan-300">google-genai</code> Python package.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Relational Data Table & CLI Output */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Database Telemetry Logs (Live Step 1.1 Sample)</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">4 verified records</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 w-12">ID</th>
                        <th className="py-2.5 px-3 w-32">Timestamp</th>
                        <th className="py-2.5 px-3 w-32">Event Type</th>
                        <th className="py-2.5 px-3">Content / Payload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                      {dummyLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 text-cyan-400 font-semibold">{log.id}</td>
                          <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                              {log.eventType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-200 truncate max-w-xs">{log.content}</td>
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
                    <span className="font-mono">tests/test_step_1_1.py Execution Output</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">EXIT CODE: 0</span>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto p-2 bg-black/40 rounded-lg">
{`======================================================================
  PROJECT OMNI-ASSISTANT: TEST STEP 1.1 (RELATIONAL DATABASE)
======================================================================
Target Database File: omni_memory.db

--- 1. SQLite Connection & Configuration Verification ---
  [✓] PRAGMA journal_mode: WAL (expected: WAL)
  [✓] PRAGMA synchronous: 1 (expected: 1/NORMAL)
  [✓] SQLite enable_load_extension support: YES

--- 2. Database Schema Initialization ---
  [✓] Table 'telemetry_logs' created: True
  [✓] Table columns detected: id, timestamp, file_path, event_type, content, metadata

--- 3. Inserting Dummy Telemetry Records ---
  [+] Inserted Record #1: [window_focus] Active Window: Terminal - python3 overseer.py (PID: 4821)...
  [+] Inserted Record #2: [command_history] Terminal Command Executed: git status -s...
  [+] Inserted Record #3: [filesystem_change] File Modified: /Users/omni/Developer/OmniAssistant/src/db/schema.py...
  [+] Inserted Record #4: [voice_transcript] Voice Transcript Snapshot: 'Overseer, show me the recent test results.'...

--- 4. Reading Back Records & Verifying Data Integrity ---
  [✓] Verified ID #1: Timestamp=2026-10-10 17:56:51 | Type=window_focus
  [✓] Verified ID #2: Timestamp=2026-10-10 17:56:51 | Type=command_history
  [✓] Verified ID #3: Timestamp=2026-10-10 17:56:51 | Type=filesystem_change
  [✓] Verified ID #4: Timestamp=2026-10-10 17:56:51 | Type=voice_transcript
  Total Records in Database: 4

--- 5. Visual Data Inspection (Relational Rows) ---
┌─────┬──────────────────────────┬─────────────────┬───────────────────────────────────────────────┐
│ ID  │ Timestamp                │ Event Type      │ Content                                       │
├─────┼──────────────────────────┼─────────────────┼───────────────────────────────────────────────┤
│ 4   │ 2026-10-10 17:56:51      │ voice_transcrip │ Voice Transcript Snapshot: 'Overseer, show me │
│ 3   │ 2026-10-10 17:56:51      │ filesystem_chan │ File Modified: /Users/omni/Developer/OmniAssi │
│ 2   │ 2026-10-10 17:56:51      │ command_history │ Terminal Command Executed: git status -s      │
│ 1   │ 2026-10-10 17:56:51      │ window_focus    │ Active Window: Terminal - python3 overseer.py │
└─────┴──────────────────────────┴─────────────────┴───────────────────────────────────────────────┘

--- 6. Structured Metrics File Check ---
  [✓] telemetry_metrics.jsonl recorded 9 structured event(s).

======================================================================
  STEP 1.1 TEST PASSED SUCCESSFULLY: ALL RELATIONAL CRUDS VERIFIED
======================================================================`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Architecture */}
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

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
              <div className="text-slate-400 mb-2 font-sans font-semibold">Local Memory & Storage Pipeline:</div>
              <pre className="text-slate-400 leading-relaxed">
{`Raw Telemetry ──► Local Embedding Model (sentence-transformers: in-memory)
                             │
                             ▼ (Strict Transaction Isolation)
                  BEGIN IMMEDIATE TRANSACTION
                  ├── INSERT INTO telemetry_logs (relational metadata)
                  ├── INSERT INTO telemetry_fts  (FTS5 keyword tokens)
                  └── INSERT INTO telemetry_vec  (384-d vector embeddings)
                  COMMIT`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-white">5-Phase Incremental Execution Roadmap</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-emerald-400">Phase 1: Unified Local Database (CURRENT)</div>
                  <div className="text-slate-400 mt-0.5">
                    Step 1.1: Relational SQLite schema & CRUD (<strong>Verified</strong>) ➔ Step 1.2: FTS5 ➔ Step 1.3: sqlite-vec ➔ Step 1.4: RRF Fusion
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">Step 1.1 Complete</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-slate-300">Phase 2: Local Telemetry & Token Governor</div>
                <div className="text-slate-400 mt-0.5">
                  macOS active window extractor (PyObjC) + Token Governor TPM throttling and noise filtering.
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-slate-300">Phase 3: Gemini Live API Integration</div>
                <div className="text-slate-400 mt-0.5">
                  Bidirectional WebSocket streaming using official Python package <code>google-genai</code>.
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-slate-300">Phase 4: Overseer & Dynamic Sub-Agent Factory</div>
                <div className="text-slate-400 mt-0.5">
                  Dynamic runtime prompt generation, /sandbox isolation, and read allowlist gates.
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-slate-300">Phase 5: Native macOS Floating HUD & Approvals</div>
                <div className="text-slate-400 mt-0.5">
                  Native macOS overlay (PyQt6 / AppKit hooks) and omnichannel approval gates.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
