"""Chat streaming endpoint."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ..llm import litellm_client

log = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    thread_id: str
    user_id: str | None = None
    messages: list[dict[str, str]] = Field(default_factory=list)
    provider: str = "openai"
    model: str = "gpt-4o-mini"
    system_prompt: str | None = None


@router.post("/v1/chat/stream")
async def chat_stream(req: ChatRequest, request: Request) -> StreamingResponse:
    log.info(
        "chat stream: thread=%s provider=%s model=%s msgs=%d",
        req.thread_id, req.provider, req.model, len(req.messages),
    )

    async def event_gen() -> Any:
        async for event in litellm_client.stream_chat(
            provider=req.provider,
            model=req.model,
            messages=req.messages,
            system_prompt=req.system_prompt,
        ):
            if await request.is_disconnected():
                log.info("client disconnected, stopping stream")
                break
            yield litellm_client.event_to_sse(event)

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
