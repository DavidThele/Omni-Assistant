/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Terminal, Shield, Cpu, Activity, CheckCircle, Search, Sparkles, GitMerge, Award, ChevronRight, Layout, Monitor, Zap, Pause, Play, AlertTriangle } from 'lucide-react';

interface GovernorStage {
  stage: string;
  budget: string;
  consumed: string;
  state: 'NORMAL' | 'THROTTLED' | 'PAUSED';
  action: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'step_2_2' | 'step_2_1' | 'step_1_4' | 'step_1_3' | 'roadmap' | 'architecture'>('step_2_2');

  const governorStages: GovernorStage[] = [
    {
      stage: "1. Baseline Normal",
      budget: "6,000 / 6,000",
      consumed: "0 (0%)",
      state: "NORMAL",
      action: "Full telemetry throughput & instant batching"
    },
    {
      stage: "2. Telemetry Influx",
      budget: "2,433 / 6,000",
      consumed: "3,500 (35%)",
      state: "THROTTLED",
      action: "Noise compression (low-priority events filtered)"
    },
    {
      stage: "3. Gemini Live Surge",
      budget: "892 / 6,000",
      consumed: "9,108 (91.1%)",
      state: "PAUSED",
      action: "Batch generation PAUSED to guarantee voice safety"
    },
    {
      stage: "4. Window Expiry",
      budget: "4,500 / 6,000",
      consumed: "5,500 (decayed)",
      state: "NORMAL",
      action: "Resumed automatically after 60s sliding window"
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
            <span className="text-slate-300 font-mono">Token Governor: Sliding 60s Window Active</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-emerald-400">Phase 2 Complete</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col space-y-6">
        {/* Phase 2 Completion Banner */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-slate-900/60 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-300 flex items-center space-x-2">
                <span>Phase 2 Milestone Complete: Local Telemetry & Token Governor</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Verified</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Window & Accessibility Tree Extractor (2.1) ➔ Token Governor TPM Throttling & Batching (2.2).
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>Next: Phase 3 Gemini Live API (Python google-genai)</span>
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('step_2_2')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_2_2'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 2.2: Token Governor & Batcher
            </button>
            <button
              onClick={() => setActiveTab('step_2_1')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_2_1'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 2.1: Window & AX Observer
            </button>
            <button
              onClick={() => setActiveTab('step_1_4')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_1_4'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 1.4: RRF Fusion
            </button>
            <button
              onClick={() => setActiveTab('step_1_3')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_1_3'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 1.3: Vector Search
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'architecture'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Architecture
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
              python3 tests/test_step_2_2.py
            </code>
          </div>
        </div>

        {/* Tab 1: Step 2.2 Token Governor */}
        {activeTab === 'step_2_2' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Token Pools & Quota Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Token Governor Specification</span>
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Passed
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Sliding Window</span>
                    <span className="font-mono text-cyan-300">60 seconds</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Reserved Voice Pool</span>
                    <span className="font-mono text-emerald-400">40% (Dedicated to Gemini Live)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Background Telemetry</span>
                    <span className="font-mono text-slate-200">60% maximum cap</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Throttle Threshold</span>
                    <span className="font-mono text-amber-400">15% - 50% remaining</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Pause Threshold</span>
                    <span className="font-mono text-rose-400">&lt; 15% remaining</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Noise Filtering</span>
                    <span className="font-mono text-cyan-300">Deduplication + Priority Pruning</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-2 font-medium">Phase 2 Gate Status:</div>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-200">
                    <strong>Phase 2 is 100% complete!</strong> Ready for human sign-off before entering <strong>Phase 3: Gemini Live API Integration</strong> via Python <code>google-genai</code>.
                  </div>
                </div>
              </div>

              {/* Protection Logic Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Uninterrupted Audio Guarantee</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  During live conversational voice sessions, audio tokens are continuously consumed. The Token Governor guarantees that background sensory telemetry never starves the live audio connection or triggers HTTP 429 quota exhaustion.
                </p>
              </div>
            </div>

            {/* Right: Simulation Matrix & CLI Console */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Token Governor Simulation Stages (Step 2.2 Test Run)</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Sliding Window Verification</span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Simulation Stage</th>
                        <th className="py-2.5 px-3 w-36">Telemetry Budget</th>
                        <th className="py-2.5 px-3 w-32">Consumed TPM</th>
                        <th className="py-2.5 px-3 w-28">State</th>
                        <th className="py-2.5 px-3">Batching Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/30">
                      {governorStages.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-200">{s.stage}</td>
                          <td className="py-2.5 px-3 text-slate-400">{s.budget}</td>
                          <td className="py-2.5 px-3 text-cyan-300">{s.consumed}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              s.state === 'NORMAL'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                                : s.state === 'THROTTLED'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                                : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                            }`}>
                              {s.state}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 text-[11px] font-sans">{s.action}</td>
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
                    <span className="font-mono">tests/test_step_2_2.py Execution Output</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">EXIT CODE: 0</span>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto p-2 bg-black/40 rounded-lg">
{`======================================================================
  PROJECT OMNI-ASSISTANT: TEST STEP 2.2 (TOKEN GOVERNOR & BATCHING LOGIC)
======================================================================
Token Governor Configuration:
  Total Max TPM:              10,000 tokens/min
  Reserved Voice Pool:        4,000 tokens/min (Gemini Live audio safety)
  Telemetry Ingestion Budget: 6,000 tokens/min

--- 1. Stage 1: Baseline Ingestion (NORMAL State) ---
  [✓] Initial State: NORMAL (Remaining Telemetry Budget: 6000/6000)
  [✓] Batch #1 Dispatched successfully:
      Events packaged:   4
      Estimated Tokens:  67
      Governor State:    NORMAL

--- 2. Stage 2: Telemetry Influx Simulation (Transition to THROTTLED) ---
  [✓] Remaining Telemetry Budget: 2,433 (40.6%)
  [✓] State Transition Detected:   THROTTLED
  [✓] Batch #2 (Throttled Compression):
      Governor State:   THROTTLED
      Prioritized Items: 2

--- 3. Stage 3: Gemini Live Audio Streaming Surge (Transition to PAUSED) ---
  [✓] Consumed Voice Tokens:      5,500
  [✓] Consumed Telemetry Tokens:  3,608
  [✓] Total Consumed:             9,108/10,000
  [✓] Remaining Telemetry Budget: 892 tokens
  [✓] Governor Critical State:    PAUSED
  [✓] Batch Dispatch during PAUSED: None
  [✓] Verified: Telemetry payload generation was successfully PAUSED to guarantee voice safety.

--- 4. Stage 4: Sliding Window Replenishment & Auto-Recovery ---
  Advancing time: t=1000.0s -> t=1070.0s (+70s)
  [✓] Post-Window Consumed Tokens: 5,500
  [✓] Restored Telemetry Budget:   4,500/6,000
  [✓] Recovered Governor State:    NORMAL
  [✓] Batch #3 Resumed: State=NORMAL, Events=2

======================================================================
  STEP 2.2 TEST PASSED SUCCESSFULLY: TOKEN GOVERNOR & BATCHING LOGIC VERIFIED
======================================================================
PHASE 2 COMPLETE: Local Telemetry & Token Governor is fully operational.`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Step 2.1 */}
        {activeTab === 'step_2_1' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Step 2.1: Window & Accessibility Tree Extractor (Verified on macOS)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Native macOS extraction via PyObjC and osascript fallback. Validated live window transitions between iTerm2 and VS Code.
            </p>
          </div>
        )}

        {/* Tab 3: Step 1.4 */}
        {activeTab === 'step_1_4' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              <span>Step 1.4: Reciprocal Rank Fusion (Verified)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Combines BM25 and cosine distance ranks via k=60 RRF reciprocal ranking.
            </p>
          </div>
        )}

        {/* Tab 4: Step 1.3 */}
        {activeTab === 'step_1_3' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Step 1.3: Vector Embeddings (Verified)</span>
            </h3>
            <p className="text-xs text-slate-400">
              384-dimensional dense vectors with transaction isolation.
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
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-emerald-400">Phase 1: Unified Local Database (COMPLETE)</div>
                <div className="text-slate-400 mt-0.5">Steps 1.1, 1.2, 1.3, 1.4 passed and verified.</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-emerald-400">Phase 2: Local Telemetry & Token Governor (COMPLETE)</div>
                <div className="text-slate-400 mt-0.5">Step 2.1 (Window Extractor) & Step 2.2 (Token Governor) verified.</div>
              </div>
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-cyan-300">Phase 3: Gemini Live API Integration (UPCOMING)</div>
                  <div className="text-slate-400 mt-0.5">
                    Step 3.1: WebSocket connection via Python <code>google-genai</code> ➔ Step 3.2: Bidirectional audio streaming with VAD.
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[11px]">Next Gate</span>
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
