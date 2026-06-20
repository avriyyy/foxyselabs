"""LangGraph agent definition.

Sprint 1: minimal responder node. Just calls the LLM with the current
message history and streams back tokens. No tools, no planning, no memory.
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from typing import Any

from langgraph.graph import END, StateGraph

from ..llm import litellm_client
from .state import AgentState

log = logging.getLogger(__name__)


async def responder_node(state: AgentState) -> AsyncIterator[dict[str, Any]]:
    """Stream the LLM response for the current state."""
    async for event in litellm_client.stream_chat(
        provider=state.get("provider", "openai"),
        model=state.get("model", "gpt-4o-mini"),
        messages=state.get("messages", []),
        system_prompt=state.get("system_prompt"),
    ):
        yield event


def build_graph() -> StateGraph:
    """Build the (single-node) agent graph.

    The graph structure is a placeholder — Sprint 3+ will add
    planner, executor, and reflector nodes.
    """
    g = StateGraph(AgentState)
    g.add_node("responder", responder_node)
    g.set_entry_point("responder")
    g.add_edge("responder", END)
    return g.compile()


# Module-level compiled graph (lazy)
_graph = None


def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph
