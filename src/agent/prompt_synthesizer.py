"""
Project Omni-Assistant - Dynamic Prompt Synthesizer.
Analyzes real-time telemetry (active window, accessibility tree hierarchy, user activity)
and hybrid memory retrieval to synthesize dynamic system prompts and tool scopes on the fly
without hardcoded static agent types.
"""

import json
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from ..logger import log_metric
from ..telemetry.token_governor import estimate_tokens, TokenGovernor


@dataclass
class SynthesizedPrompt:
    """Represents a dynamically generated prompt package for an ephemeral sub-agent."""
    agent_name: str
    mission: str
    system_prompt: str
    suggested_tool_scope: List[str]
    detected_domain: str
    context_tokens: int
    context_summary: str
    created_at: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_name": self.agent_name,
            "mission": self.mission,
            "system_prompt": self.system_prompt,
            "suggested_tool_scope": self.suggested_tool_scope,
            "detected_domain": self.detected_domain,
            "context_tokens": self.context_tokens,
            "context_summary": self.context_summary,
            "created_at": self.created_at,
        }


# Standard catalog of native sandboxed tools available for dynamic scoping
TOOL_CATALOG = {
    "read_file": "Reads file contents safely from allowlisted filesystem paths.",
    "write_sandbox": "Writes or modifies files strictly within the /sandbox directory.",
    "search_memory": "Queries local SQLite hybrid RRF memory for relevant historical logs.",
    "run_sandbox_command": "Executes sandboxed bash/CLI commands with approval checks.",
    "analyze_ast": "Parses and inspects source code AST without executing.",
    "diff_files": "Computes unified diffs between files or code snippets.",
    "inspect_accessibility": "Inspects macOS active UI accessibility tree elements.",
    "summarize_document": "Produces concise executive summaries from long text snippets."
}


class PromptSynthesizer:
    """
    Dynamically generates contextual sub-agent prompts and determines required
    tool scopes on demand based on live OS telemetry and local memory retrieval.
    """

    def __init__(self, token_governor: Optional[TokenGovernor] = None):
        self.token_governor = token_governor

    def detect_domain_and_tools(
        self,
        app_name: str,
        window_title: str,
        accessibility_tree: Optional[Dict[str, Any]] = None,
        user_intent: Optional[str] = None
    ) -> tuple[str, str, List[str]]:
        """
        Dynamically derives the operational domain, sub-agent moniker, and tool scope.
        Rather than hardcoded fixed agent classes, this synthesizes fine-grained
        specialized personas.
        """
        combined = f"{app_name} {window_title} {user_intent or ''}".lower()

        # Dynamic keyword & context analysis
        if any(kw in combined for kw in ["code", "python", "xcode", "debug", "traceback", "crash", "test", "compiler", ".py", ".rs", ".ts"]):
            domain = "code_engineering"
            name = f"{app_name.capitalize() or 'Code'}EngineeringSpecialist"
            tools = ["read_file", "write_sandbox", "analyze_ast", "diff_files", "search_memory"]
        elif any(kw in combined for kw in ["terminal", "iterm", "bash", "zsh", "shell", "git", "brew", "docker"]):
            domain = "devops_terminal"
            name = f"TerminalOpsNavigator"
            tools = ["read_file", "write_sandbox", "run_sandbox_command", "search_memory"]
        elif any(kw in combined for kw in ["safari", "chrome", "firefox", "browser", "docs", "http", "www", "research", "api reference"]):
            domain = "knowledge_research"
            name = f"WebAndDocsResearcher"
            tools = ["search_memory", "summarize_document", "inspect_accessibility"]
        elif any(kw in combined for kw in ["notes", "notion", "word", "pages", "markdown", "spec", "plan", "readme", ".md"]):
            domain = "document_authoring"
            name = f"DocumentationAssistant"
            tools = ["read_file", "write_sandbox", "diff_files", "summarize_document"]
        elif any(kw in combined for kw in ["finder", "directory", "folder", "organize", "files"]):
            domain = "filesystem_organization"
            name = f"FileWorkflowManager"
            tools = ["read_file", "write_sandbox", "search_memory"]
        else:
            domain = "general_os_orchestration"
            name = f"ContextualOSOrchestrator"
            tools = ["search_memory", "inspect_accessibility", "summarize_document"]

        # If user explicitly requested specific actions, dynamically augment tool scope
        if user_intent:
            intent_lower = user_intent.lower()
            if "search" in intent_lower or "find" in intent_lower:
                if "search_memory" not in tools:
                    tools.append("search_memory")
            if "run" in intent_lower or "execute" in intent_lower:
                if "run_sandbox_command" not in tools:
                    tools.append("run_sandbox_command")
            if "diff" in intent_lower or "compare" in intent_lower:
                if "diff_files" not in tools:
                    tools.append("diff_files")
            if "edit" in intent_lower or "write" in intent_lower or "create" in intent_lower:
                if "write_sandbox" not in tools:
                    tools.append("write_sandbox")

        return domain, name, tools

    def synthesize(
        self,
        app_name: str,
        window_title: str,
        accessibility_snippet: Optional[str] = None,
        retrieved_memory: Optional[List[Dict[str, Any]]] = None,
        user_intent: Optional[str] = None,
        max_prompt_tokens: int = 2500
    ) -> SynthesizedPrompt:
        """
        Synthesizes a tailored, ephemeral prompt and tool bundle.
        """
        start_time = time.perf_counter()

        domain, agent_name, suggested_tools = self.detect_domain_and_tools(
            app_name=app_name,
            window_title=window_title,
            user_intent=user_intent
        )

        # Build context summary
        context_parts = [f"Active Application: {app_name}"]
        if window_title:
            context_parts.append(f"Window Title: '{window_title}'")
        if accessibility_snippet:
            context_parts.append(f"UI Elements: {accessibility_snippet}")

        # Integrate retrieved memory snippets (RRF hybrid search results)
        memory_snippets = []
        if retrieved_memory:
            for i, item in enumerate(retrieved_memory[:3], 1):
                content = item.get("content", "")
                if len(content) > 180:
                    content = content[:180] + "..."
                memory_snippets.append(f"[{i}] {content}")

        if memory_snippets:
            context_parts.append("Retrieved Local Memory:\n" + "\n".join(memory_snippets))

        context_summary = "\n".join(context_parts)

        # Formulate explicit mission
        if user_intent:
            mission = f"Address user request '{user_intent}' while user is active in [{app_name}] '{window_title}'."
        else:
            mission = f"Assist user with tasks currently active in [{app_name}] '{window_title}'."

        # Assemble full system prompt
        tool_descriptions = "\n".join([f"- {tool}: {TOOL_CATALOG.get(tool, 'Dynamic tool')}" for tool in suggested_tools])

        system_prompt = (
            f"You are {agent_name}, an ephemeral sub-agent dynamically spawned by Project Omni-Assistant Overseer.\n"
            f"Mission: {mission}\n"
            f"Domain: {domain}\n\n"
            f"=== CURRENT USER ENVIRONMENT ===\n"
            f"{context_summary}\n\n"
            f"=== GRANTED TOOL SCOPE ===\n"
            f"You have been granted access EXCLUSIVELY to the following tools:\n"
            f"{tool_descriptions}\n\n"
            f"=== OPERATIONAL INSTRUCTIONS ===\n"
            f"1. You are ephemeral: perform your task directly, return concise findings, and exit.\n"
            f"2. Strict Sandbox Isolation: all file write/modify operations must be bounded to /sandbox.\n"
            f"3. Do not attempt to invoke tools outside your granted tool scope.\n"
            f"4. Be direct, factual, and omit conversational pleasantries."
        )

        # Calculate tokens
        prompt_tokens = estimate_tokens(system_prompt)

        # Budget check with TokenGovernor if available
        if self.token_governor and prompt_tokens > max_prompt_tokens:
            # Compress context if necessary
            context_summary = f"Active App: {app_name} | Window: {window_title}"
            system_prompt = (
                f"You are {agent_name}, an ephemeral sub-agent spawned by Omni-Assistant.\n"
                f"Mission: {mission}\n"
                f"Environment: {context_summary}\n"
                f"Allowed Tools: {', '.join(suggested_tools)}\n"
                f"Instructions: Complete the task concisely within /sandbox bounds."
            )
            prompt_tokens = estimate_tokens(system_prompt)

        latency_ms = (time.perf_counter() - start_time) * 1000

        log_metric(
            operation="dynamic_prompt_synthesis",
            latency_ms=latency_ms,
            payload_size=len(system_prompt),
            status="success",
            details={
                "agent_name": agent_name,
                "domain": domain,
                "tool_scope": suggested_tools,
                "tokens": prompt_tokens,
                "app": app_name
            }
        )

        return SynthesizedPrompt(
            agent_name=agent_name,
            mission=mission,
            system_prompt=system_prompt,
            suggested_tool_scope=suggested_tools,
            detected_domain=domain,
            context_tokens=prompt_tokens,
            context_summary=context_summary
        )
