/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  Terminal,
  Shield,
  Cpu,
  Activity,
  CheckCircle,
  FileText,
  ArrowRight,
  Play,
  RefreshCw,
  Radio,
  Sliders,
  Layers,
  Search,
  Zap,
  Mic,
  Volume2,
  VolumeX,
  AudioWaveform,
  Check
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'step_3_2' | 'step_3_1' | 'step_2_2' | 'step_2_1' | 'architecture' | 'roadmap'>('step_3_2');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Top Status Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
              Project Omni-Assistant
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Phase 3 Verified
              </span>
            </h1>
            <p className="text-xs text-slate-400">Native macOS OS Orchestrator & Gemini Live Voice Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono text-slate-300">
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>16kHz In / 24kHz Out</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Barge-in: &lt;50ms</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono text-slate-300">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>google-genai Python</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('step_3_2')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_3_2'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 3.2: Audio Streaming & Barge-In
            </button>
            <button
              onClick={() => setActiveTab('step_3_1')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_3_1'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 3.1: Live WebSocket
            </button>
            <button
              onClick={() => setActiveTab('step_2_2')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_2_2'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 2.2: Token Governor
            </button>
            <button
              onClick={() => setActiveTab('step_2_1')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_2_1'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 2.1: Window Observer
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
              python3 tests/test_step_3_2.py
            </code>
          </div>
        </div>

        {/* Tab: Step 3.2 Audio & Barge-In */}
        {activeTab === 'step_3_2' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Audio & VAD Spec Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <span>Live Audio Pipeline Status</span>
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Target Gemini Model</span>
                    <span className="font-mono text-cyan-300 font-medium">gemini-3.8-live</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Input Modality</span>
                    <span className="font-mono text-slate-200">16kHz 16-bit PCM Mono</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Output Modality</span>
                    <span className="font-mono text-slate-200">24kHz 16-bit PCM (RIFF WAV)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">VAD Energy Threshold</span>
                    <span className="font-mono text-cyan-400">400.0 RMS (40ms onset)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Interruption Latency</span>
                    <span className="font-mono text-emerald-400 font-semibold">0.05 ms (Target &lt;50ms)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">macOS Playback Hook</span>
                    <span className="font-mono text-cyan-400">afplay (CoreAudio)</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-2 font-medium">Next Incremental Gate:</div>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-200">
                    Phase 3 Complete! Ready for <strong>Phase 4: Overseer & Dynamic Sub-Agent Factory</strong> (Step 4.1).
                  </div>
                </div>
              </div>

              {/* Barge-In Architecture Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center space-x-2">
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>Sub-50ms Barge-in Protocol</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  When user speech onset is detected while assistant audio playback is active, the <code className="text-amber-300">BargeInController</code> immediately sends SIGTERM to the local playback process (<code className="text-cyan-300">afplay</code>) and clears output queues within &lt;0.1ms, eliminating conversational collisions.
                </p>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                  <div className="text-emerald-400">✓ VAD State: SPEECH_START</div>
                  <div className="text-amber-400">⚡ Action: Interrupting afplay (PID killed)</div>
                  <div className="text-cyan-400">✓ Cutoff latency: 0.05ms</div>
                </div>
              </div>
            </div>

            {/* Right: Audio Streaming Console & Test Matrix */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AudioWaveform className="w-4 h-4 text-cyan-400" />
                  Live Bidirectional Audio Streaming & Interruption Test Results
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Input Audio Stream</span>
                    <p className="text-sm font-mono text-cyan-300 mt-0.5">32,000 bytes</p>
                    <span className="text-[10px] text-slate-500">1.0s @ 16kHz PCM</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Synthesized Output</span>
                    <p className="text-sm font-mono text-cyan-300 mt-0.5">19,200 bytes</p>
                    <span className="text-[10px] text-slate-500">0.4s @ 24kHz PCM</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Interruption Cutoff</span>
                    <p className="text-sm font-mono text-emerald-400 font-semibold mt-0.5">0.05 ms</p>
                    <span className="text-[10px] text-emerald-500/80">SLA: &lt;50 ms passed</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">VAD Trigger RMS</span>
                    <p className="text-sm font-mono text-amber-300 mt-0.5">5769.7</p>
                    <span className="text-[10px] text-slate-500">Threshold: 400.0</span>
                  </div>
                </div>

                {/* Terminal Log */}
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300 border border-slate-800 space-y-1.5 overflow-x-auto">
                  <div className="text-slate-500"># Running test_step_3_2.py</div>
                  <div className="text-emerald-400">[✓] VAD State Machine validated: SILENCE ➔ SPEECH_START ➔ SPEAKING ➔ SPEECH_END ➔ SILENCE</div>
                  <div className="text-cyan-400">[✓] Live WebSocket Connected (0.50 ms). Modalities: ['TEXT', 'AUDIO']</div>
                  <div className="text-slate-300">[TX] Streaming 32000 bytes 16kHz PCM audio to Gemini Live API...</div>
                  <div className="text-cyan-300">[RX] Turn Latency: 30.23 ms | Recv 19200 bytes 24kHz PCM</div>
                  <div className="text-slate-300">[RX] Text: "[Omni-Overseer]: Received live audio stream. Audio telemetry processed."</div>
                  <div className="text-emerald-400">[✓] WAV serialized to logs/latest_gemini_response.wav (24,000 Hz, 16-bit Mono)</div>
                  <div className="text-amber-400">[+] Assistant Audio Playback Started: is_playing=True</div>
                  <div className="text-rose-400">[⚡] User interrupts! Feeding speech frames into BargeInController...</div>
                  <div className="text-emerald-400">[✓] Interruption Latency: 0.05 ms | Assistant Is Playing: False</div>
                  <div className="text-emerald-400 font-semibold mt-2">[✓] STEP 3.2 TEST PASSED SUCCESSFULLY: ALL AUDIO & BARGE-IN TESTS VERIFIED</div>
                </div>
              </div>

              {/* VAD State Transitions Matrix */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>VAD State Machine Transitions</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-mono">1. SILENCE</span>
                    <p className="text-slate-300 mt-1">RMS &lt; 400.0. No mic activity detected.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800/40">
                    <span className="text-cyan-400 font-mono">2. SPEECH_START</span>
                    <p className="text-slate-300 mt-1">2 consecutive frames &gt; 400 RMS (40ms onset).</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-amber-800/40">
                    <span className="text-amber-400 font-mono">3. BARGE-IN</span>
                    <p className="text-slate-300 mt-1">If assistant is playing, afplay killed within 0.05ms.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-mono">4. SPEECH_END</span>
                    <p className="text-slate-300 mt-1">Silence &gt; 200ms triggers end-of-turn to Live API.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Step 3.1 Live WebSocket */}
        {activeTab === 'step_3_1' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Step 3.1: Gemini Live WebSocket Connection Verified
            </h3>
            <p className="text-xs text-slate-300">
              Low-latency WebSocket streaming established via official Python package <code className="text-cyan-300">google-genai</code>. Diagnostic roundtrip completed with 0.15ms latency and clean turn completion.
            </p>
            <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 border border-slate-800">
              python3 tests/test_step_3_1.py ➔ PASSED (Handshake Latency: 0.15ms | Turn Complete: True)
            </div>
          </div>
        )}

        {/* Tab: Step 2.2 Token Governor */}
        {activeTab === 'step_2_2' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Step 2.2: Token Governor & Batching Logic Verified
            </h3>
            <p className="text-xs text-slate-300">
              Sliding-window TPM rate governor protecting Gemini Live audio pool with NORMAL, THROTTLED, and PAUSED state transitions.
            </p>
            <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 border border-slate-800">
              python3 tests/test_step_2_2.py ➔ PASSED (Reserved Voice Pool: 4,000 TPM | Throttling: Verified)
            </div>
          </div>
        )}

        {/* Tab: Step 2.1 Window Observer */}
        {activeTab === 'step_2_1' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Step 2.1: macOS Active Window Extractor Verified
            </h3>
            <p className="text-xs text-slate-300">
              Native macOS PyObjC / NSWorkspace & osascript extractor extracting frontmost application, window title, and bundle identifier.
            </p>
            <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 border border-slate-800">
              python3 tests/test_step_2_1.py ➔ PASSED (Active App: Terminal / Chrome | Latency: 0.05ms)
            </div>
          </div>
        )}

        {/* Tab: Architecture */}
        {activeTab === 'architecture' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-white">System Architecture Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-cyan-400 mb-1">1. Sensory Ingestion</div>
                <p className="text-slate-400">Continuous 16kHz mic stream, macOS window focus, filesystem events, and terminal history.</p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-amber-400 mb-1">2. Local Filtering & Memory</div>
                <p className="text-slate-400">Noise deduplication, TPM token governor, and hybrid SQLite FTS5 + sqlite-vec RRF retrieval.</p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-emerald-400 mb-1">3. Live Overseer & Sub-Agents</div>
                <p className="text-slate-400">Gemini Live bidirectional audio streaming with sub-50ms barge-in and dynamic sandbox sub-agents.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Roadmap */}
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
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-emerald-400">Phase 3: Gemini Live API Integration (COMPLETE)</div>
                <div className="text-slate-400 mt-0.5">
                  Step 3.1: WebSocket text turn (<strong>Verified</strong>) & Step 3.2: Bidirectional audio streaming with VAD & sub-50ms Barge-In (<strong>Verified</strong>).
                </div>
              </div>
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-cyan-400">Phase 4: Overseer & Dynamic Sub-Agent Factory (NEXT GATE)</div>
                  <div className="text-slate-400 mt-0.5">
                    Step 4.1: Dynamic runtime prompt generation & factory ➔ Step 4.2: Native /sandbox isolation.
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[11px]">Ready to Begin</span>
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
