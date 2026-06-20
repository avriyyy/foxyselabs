"""LiteLLM wrapper with multi-provider streaming support."""

from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from typing import Any

import litellm

from ..config import settings

log = logging.getLogger(__name__)

# Quiet down litellm's verbose logging
litellm.set_verbosity = "warning"
litellm.drop_params = True


SUPPORTED_PROVIDERS = ("openai", "anthropic", "ollama")


def _resolve_api_key(provider: str) -> str | None:
    if provider == "openai":
        return settings.openai_api_key
    if provider == "anthropic":
        return settings.anthropic_api_key
    if provider == "ollama":
        return None  # ollama uses base_url, no key
    return None


def _build_kwargs(
    provider: str,
    model: str,
    messages: list[dict[str, str]],
    system_prompt: str | None,
    **extra: Any,
) -> dict[str, Any]:
    """Translate provider+model into LiteLLM kwargs."""
    # Normalize model id (LiteLLM expects "openai/gpt-4o-mini" or "gpt-4o-mini")
    full_model = model if "/" in model else f"{provider}/{model}"

    msgs: list[dict[str, str]] = []
    if system_prompt:
        msgs.append({"role": "system", "content": system_prompt})
    msgs.extend(messages)

    kwargs: dict[str, Any] = {
        "model": full_model,
        "messages": msgs,
        "stream": True,
    }

    api_key = _resolve_api_key(provider)
    if api_key:
        kwargs["api_key"] = api_key
    if provider == "ollama" and settings.ollama_base_url:
        kwargs["api_base"] = settings.ollama_base_url

    kwargs.update(extra)
    return kwargs


async def stream_chat(
    provider: str,
    model: str,
    messages: list[dict[str, str]],
    system_prompt: str | None = None,
    **extra: Any,
) -> AsyncIterator[dict[str, Any]]:
    """Yield SSE-ready event dicts for the chat completion stream.

    Each event has shape: {"type": "...", ...payload}
    Event types:
      - message.assistant  {delta: str}
      - usage             {prompt_tokens, completion_tokens}
      - error             {code, message}
    """
    if provider not in SUPPORTED_PROVIDERS:
        yield {"type": "error", "code": "invalid_provider", "message": f"unsupported provider: {provider}"}
        return

    kwargs = _build_kwargs(provider, model, messages, system_prompt, **extra)
    log.info("calling %s model=%s", provider, model)

    try:
        response = await litellm.acompletion(**kwargs)
    except Exception as exc:  # noqa: BLE001
        log.exception("litellm error")
        yield {
            "type": "error",
            "code": "llm_error",
            "message": str(exc),
        }
        return

    prompt_tokens = 0
    completion_tokens = 0
    final_model = model

    async for chunk in response:
        try:
            choice = chunk["choices"][0]
            delta = choice.get("delta", {}) or {}
            content = delta.get("content")
            if content:
                yield {"type": "message.assistant", "delta": content}

            if hasattr(chunk, "usage") and chunk.usage:
                prompt_tokens = getattr(chunk.usage, "prompt_tokens", 0) or 0
                completion_tokens = getattr(chunk.usage, "completion_tokens", 0) or 0

            if hasattr(chunk, "model") and chunk.model:
                final_model = chunk.model
        except (KeyError, IndexError, TypeError):
            continue

    yield {
        "type": "usage",
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "model": final_model,
    }
    yield {"type": "thread.end", "reason": "done"}


def event_to_sse(event: dict[str, Any]) -> str:
    """Format a dict event as an SSE `data:` line."""
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
