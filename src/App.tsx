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
  Check,
  Bot,
  Lock,
  Unlock,
  GitBranch,
  Boxes,
  Code,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface Scenario {
  id: string;
  app: string;
  window: string;
  intent: string;
  domain: string;
  agentName: string;
  tools: string[];
  contextTokens: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'vscode',
    app: 'VS Code',
    window: 'src/live/gemini_live.py — omni-assistant (Workspace)',
    intent: 'Investigate memory leak in SQLite connection pool & verify WAL mode',
    domain: 'code_engineering',
    agentName: 'VsCodeEngineeringSpecialist',
    tools: ['read_file', 'write_sandbox', 'analyze_ast', 'diff_files', 'search_memory'],
    contextTokens: 310,
  },
  {
    id: 'iterm',
    app: 'iTerm2',
    window: 'zsh (ssh production-cluster-01) 80x24',
    intent: 'Inspect disk space and safely kill hanging docker containers',
    domain: 'devops_terminal',
    agentName: 'TerminalOpsNavigator',
    tools: ['read_file', 'write_sandbox', 'run_sandbox_command', 'search_memory'],
    contextTokens: 290,
  },
  {
    id: 'safari',
    app: 'Safari',
    window: 'Gemini Live API Reference — Google AI for Developers',
    intent: 'Summarize WebSocket bidirectional streaming payload requirements',
    domain: 'knowledge_research',
    agentName: 'WebAndDocsResearcher',
    tools: ['search_memory', 'summarize_document', 'inspect_accessibility'],
    contextTokens: 276,
  },
  {
    id: 'xcode',
    app: 'Xcode',
    window: 'OmniAssistant.xcodeproj — Build Settings & Frameworks',
    intent: 'Analyze build error and diff changes against latest release commit',
    domain: 'code_engineering',
    agentName: 'XcodeEngineeringSpecialist',
    tools: ['read_file', 'write_sandbox', 'analyze_ast', 'diff_files', 'search_memory'],
    contextTokens: 325,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'step_4_1' | 'step_3_2' | 'step_3_1' | 'step_2_2' | 'step_2_1' | 'architecture' | 'roadmap'>('step_4_1');
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [simulatedLifecycle, setSimulatedLifecycle] = useState<'SPAWNED' | 'ACTIVE' | 'COMPLETED' | 'DISPOSED'>('DISPOSED');
  const [toolTestStatus, setToolTestStatus] = useState<{ tool: string; status: 'idle' | 'success' | 'blocked'; msg: string }>({
    tool: '',
    status: 'idle',
    msg: ''
  });

  const runLifecycleSimulation = () => {
    setSimulatedLifecycle('SPAWNED');
    setTimeout(() => {
      setSimulatedLifecycle('ACTIVE');
      setTimeout(() => {
        setSimulatedLifecycle('COMPLETED');
        setTimeout(() => {
          setSimulatedLifecycle('DISPOSED');
        }, 1200);
      }, 1200);
    }, 800);
  };

  const testToolAccess = (toolName: string) => {
    if (selectedScenario.tools.includes(toolName)) {
      setToolTestStatus({
        tool: toolName,
        status: 'success',
        msg: `[GRANTED] Tool '${toolName}' executed successfully within /sandbox boundaries.`
      });
    } else {
      setToolTestStatus({
        tool: toolName,
        status: 'blocked',
        msg: `[BLOCKED] SecurityError: Tool '${toolName}' is NOT in allowed scope [${selectedScenario.tools.join(', ')}].`
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-black">
      {/* Top Status Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
              Project Omni-Assistant
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Phase 4.1 Verified
              </span>
            </h1>
            <p className="text-xs text-slate-400">Native macOS OS Orchestrator & Ephemeral Sub-Agent Factory</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono text-slate-300">
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ephemeral Sub-Agents</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono text-slate-300">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Scoped Allowlist Gates</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono text-slate-300">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>SLA: &lt;1ms Synthesis</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex space-x-2 flex-wrap gap-y-1">
            <button
              onClick={() => setActiveTab('step_4_1')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_4_1'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 4.1: Sub-Agent Factory & Synthesis
            </button>
            <button
              onClick={() => setActiveTab('step_3_2')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'step_3_2'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Step 3.2: Audio & Barge-In
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
              python3 tests/test_step_4_1.py
            </code>
          </div>
        </div>

        {/* Tab: Step 4.1 Sub-Agent Factory & Synthesis */}
        {activeTab === 'step_4_1' && (
          <div className="space-y-6">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Factory Architecture</span>
                  <Boxes className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-sm font-semibold text-white">Dynamic Ephemeral</div>
                <div className="text-[11px] text-emerald-400 font-mono">Zero Hardcoded Types</div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Tool Scoping Gate</span>
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-sm font-semibold text-white">Strict Allowlist</div>
                <div className="text-[11px] text-amber-400 font-mono">Security Blocks Enforced</div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Memory Integration</span>
                  <Database className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-sm font-semibold text-white">Unified SQLite RRF</div>
                <div className="text-[11px] text-indigo-300 font-mono">Hybrid Vector + FTS5</div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Turn Latency SLA</span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-sm font-semibold text-white">0.66 ms / turn</div>
                <div className="text-[11px] text-emerald-400 font-mono">Target: &lt;100 ms</div>
              </div>
            </div>

            {/* Interactive Scenario & Synthesis Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Telemetry Context Selector */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>Live Telemetry Feeds</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Window Observer
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Select a simulated macOS application context to observe real-time prompt synthesis and dynamic tool scope allocation:
                  </p>

                  <div className="space-y-2">
                    {SCENARIOS.map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => setSelectedScenario(sc)}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                          selectedScenario.id === sc.id
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-200">{sc.app}</span>
                          <span className="font-mono text-[10px] text-cyan-400">{sc.domain}</span>
                        </div>
                        <div className="truncate text-[11px] text-slate-400 font-mono">{sc.window}</div>
                      </button>
                    ))}
                  </div>

                  {/* Lifecycle Trigger */}
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={runLifecycleSimulation}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Simulate Ephemeral Sub-Agent Turn</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Agent Lifecycle State Machine Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Ephemeral Lifecycle State
                  </h4>
                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                    <div
                      className={`p-2 rounded border ${
                        simulatedLifecycle === 'SPAWNED'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      SPAWNED
                    </div>
                    <div
                      className={`p-2 rounded border ${
                        simulatedLifecycle === 'ACTIVE'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      ACTIVE
                    </div>
                    <div
                      className={`p-2 rounded border ${
                        simulatedLifecycle === 'COMPLETED'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      COMPLETED
                    </div>
                    <div
                      className={`p-2 rounded border ${
                        simulatedLifecycle === 'DISPOSED'
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      DISPOSED
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {simulatedLifecycle === 'DISPOSED'
                      ? 'Sub-agent memory buffers wiped and unmapped. Zero resource leak.'
                      : `Sub-agent currently in state: ${simulatedLifecycle}`}
                  </p>
                </div>
              </div>

              {/* Center & Right Column: Synthesized Blueprint & Tool Scoping Gate */}
              <div className="lg:col-span-2 space-y-4">
                {/* Dynamically Synthesized Sub-Agent Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-cyan-400 font-mono">Dynamically Spawned Persona</div>
                      <h3 className="text-base font-semibold text-white flex items-center gap-2">
                        <span>{selectedScenario.agentName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Ephemeral ID: subagent_4a99022b
                        </span>
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Budgeted Context</div>
                      <div className="text-xs font-mono text-cyan-300 font-medium">
                        {selectedScenario.contextTokens} tokens
                      </div>
                    </div>
                  </div>

                  {/* Mission */}
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs space-y-1">
                    <div className="text-slate-400 font-medium">Dynamic Mission:</div>
                    <div className="text-slate-200">{selectedScenario.intent}</div>
                  </div>

                  {/* Allocated Tool Scope Matrix */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">Allocated Tool Scope (Allowlist Only):</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {selectedScenario.tools.length} primitives granted
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedScenario.tools.map((tool) => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 rounded bg-slate-800/90 border border-slate-700/80 text-cyan-300 font-mono text-[11px] flex items-center space-x-1.5"
                        >
                          <Lock className="w-3 h-3 text-cyan-400" />
                          <span>{tool}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Tool Access Test */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-lg space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Security Gate Interactive Check</span>
                      <span className="text-slate-400 text-[11px]">Click to test permission boundaries:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => testToolAccess('read_file')}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-cyan-500"
                      >
                        Test: read_file
                      </button>
                      <button
                        onClick={() => testToolAccess('diff_files')}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-cyan-500"
                      >
                        Test: diff_files
                      </button>
                      <button
                        onClick={() => testToolAccess('run_sandbox_command')}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-cyan-500"
                      >
                        Test: run_sandbox_command
                      </button>
                      <button
                        onClick={() => testToolAccess('delete_system_database')}
                        className="px-2.5 py-1 rounded bg-rose-950/30 border border-rose-800/50 text-xs text-rose-300 hover:bg-rose-900/40"
                      >
                        Test Unauthorized: delete_system_database
                      </button>
                    </div>

                    {toolTestStatus.status !== 'idle' && (
                      <div
                        className={`p-2.5 rounded text-xs font-mono ${
                          toolTestStatus.status === 'success'
                            ? 'bg-emerald-950/30 border border-emerald-800/40 text-emerald-300'
                            : 'bg-rose-950/30 border border-rose-800/40 text-rose-300'
                        }`}
                      >
                        {toolTestStatus.msg}
                      </div>
                    )}
                  </div>

                  {/* Synthesized System Prompt Preview */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                      <span>Synthesized System Instruction Prompt</span>
                      <span className="font-mono text-[10px] text-slate-500">Live Preview</span>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                      <span className="text-cyan-400">You are {selectedScenario.agentName}</span>, an ephemeral sub-agent dynamically spawned by Project Omni-Assistant Overseer.<br />
                      <span className="text-amber-300">Mission:</span> Address user request '{selectedScenario.intent}' while user is active in [{selectedScenario.app}] '{selectedScenario.window}'.<br />
                      <span className="text-indigo-300">Domain:</span> {selectedScenario.domain}<br /><br />
                      <span className="text-slate-400">=== GRANTED TOOL SCOPE ===</span><br />
                      {selectedScenario.tools.map((t) => (
                        <span key={t} className="block text-slate-400">• {t}</span>
                      ))}
                      <br />
                      <span className="text-slate-400">=== OPERATIONAL INSTRUCTIONS ===</span><br />
                      1. You are ephemeral: perform your task directly, return concise findings, and exit.<br />
                      2. Strict Sandbox Isolation: all file write/modify operations must be bounded to /sandbox.<br />
                      3. Do not attempt to invoke tools outside your granted tool scope.<br />
                      4. Be direct, factual, and omit conversational pleasantries.
                    </div>
                  </div>
                </div>

                {/* Gate to Step 4.2 */}
                <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900/60 border border-cyan-800/40 rounded-xl p-5 shadow-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                        Next Gate Ready
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Phase 4, Step 4.2
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">
                      Native Sandbox Executor (/sandbox Boundary & Destructive Modifier Intercepts)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Enforces hard chroot/path bounds to <code>/sandbox</code>, implements read allowlists, and intercepts destructive operations before execution.
                    </p>
                  </div>
                  <div className="pl-4">
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
                      <span>Ready</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Step 3.2 Audio & Barge-In */}
        {activeTab === 'step_3_2' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-cyan-400" />
                  <span>Audio Specifications</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Input Audio</span>
                    <span className="font-mono text-cyan-300">16kHz 16-bit Mono PCM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Synthesized Output</span>
                    <span className="font-mono text-cyan-300">24kHz 16-bit Mono PCM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">VAD Frame Size</span>
                    <span className="font-mono text-cyan-300">20 ms (640 bytes)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Barge-in SLA</span>
                    <span className="font-mono text-emerald-400">&lt; 50 ms (Actual: 0.04 ms)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-semibold text-white">VAD & Barge-In Diagnostics</h3>
              <p className="text-xs text-slate-400">
                Bidirectional streaming audio with sub-50ms native interruption verified via <code>tests/test_step_3_2.py</code>.
              </p>
              <div className="p-3 bg-slate-950 font-mono text-xs text-emerald-400 rounded-lg">
                [✓] VAD State Machine validated: SILENCE ➔ SPEECH_START ➔ SPEAKING ➔ SPEECH_END ➔ SILENCE<br />
                [✓] Native playback cutoff latency: 0.04 ms upon incoming user voice.
              </div>
            </div>
          </div>
        )}

        {/* Tab: Step 3.1 Live WebSocket */}
        {activeTab === 'step_3_1' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-white">Step 3.1: Live WebSocket Diagnostics</h3>
            <p className="text-xs text-slate-400">
              Low-latency WebSocket connectivity established using Python SDK <code>google-genai</code>.
            </p>
            <div className="p-3 bg-slate-950 font-mono text-xs text-cyan-300 rounded-lg">
              python3 tests/test_step_3_1.py ➔ PASSED (Handshake: 0.29ms | Roundtrip: 29.68ms)
            </div>
          </div>
        )}

        {/* Tab: Step 2.2 Token Governor */}
        {activeTab === 'step_2_2' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-white">Step 2.2: Token Governor & Batching</h3>
            <p className="text-xs text-slate-400">
              Guarantees voice budget (25k TPM reserved) by dynamically throttling background telemetry batches.
            </p>
            <div className="p-3 bg-slate-950 font-mono text-xs text-cyan-300 rounded-lg">
              python3 tests/test_step_2_2.py ➔ PASSED (States: NORMAL ➔ THROTTLED ➔ PAUSED)
            </div>
          </div>
        )}

        {/* Tab: Step 2.1 Window Observer */}
        {activeTab === 'step_2_1' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-white">Step 2.1: Window Observer & PyObjC</h3>
            <p className="text-xs text-slate-400">
              Active window extractor and accessibility tree inspection via macOS PyObjC / osascript.
            </p>
            <div className="p-3 bg-slate-950 font-mono text-xs text-cyan-300 rounded-lg">
              python3 tests/test_step_2_1.py ➔ PASSED (Active App: Terminal / Chrome | Latency: 0.05ms)
            </div>
          </div>
        )}

        {/* Tab: Architecture */}
        {activeTab === 'architecture' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-semibold text-white">System Architecture Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-cyan-400 mb-1">1. Sensory Ingestion</div>
                <p className="text-slate-400">Continuous 16kHz mic stream, macOS window focus, filesystem events, and terminal history.</p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-amber-400 mb-1">2. Local Filtering & Memory</div>
                <p className="text-slate-400">Noise deduplication, TPM token governor, and hybrid SQLite FTS5 + sqlite-vec RRF retrieval.</p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-emerald-400 mb-1">3. Live Overseer Voice</div>
                <p className="text-slate-400">Gemini Live bidirectional audio streaming with sub-50ms barge-in and VAD state machine.</p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="font-semibold text-indigo-400 mb-1">4. Sub-Agent Factory</div>
                <p className="text-slate-400">Dynamic prompt synthesis, zero hardcoded types, scoped tool allowlists, and /sandbox bounds.</p>
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
                  Step 3.1 (WebSocket handshake) & Step 3.2 (Bidirectional audio streaming, VAD & barge-in) verified.
                </div>
              </div>
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-cyan-400">Phase 4: Overseer & Dynamic Sub-Agent Factory</div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">Step 4.1 Done</span>
                </div>
                <div className="text-slate-300 text-xs">
                  • <strong>Step 4.1</strong>: Dynamic prompt synthesis & ephemeral sub-agent factory (<strong>Verified & Complete</strong>)<br />
                  • <strong>Step 4.2</strong>: Native sandbox executor bounded to <code>/sandbox</code> with read allowlist and destructive modifier intercepts (<strong>NEXT GATE</strong>)
                </div>
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
