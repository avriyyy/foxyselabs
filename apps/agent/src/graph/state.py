"""LangGraph state definitions."""

from __future__ import annotations

from typing import TypedDict


class AgentState(TypedDict, total=False):
    """State carried through the agent graph for one turn.

    For Sprint 1 we keep this minimal: just the conversation history.
    Sprint 3+ will add workspace_context, plan, tool_history, etc.
    """

    messages: list[dict[str, str]]
    system_prompt: str
    provider: str
    model: str
