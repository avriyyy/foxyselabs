"""Chat streaming endpoint (drives Claude Code subprocess)."""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from .. import claudecode
from ..config import settings

log = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    thread_id: str | None = None
    user_id: str | None = None
    content: str
    workspace: str | None = None
    system_prompt: str | None = None


@router.post("/v1/chat/stream")
async def chat_stream(req: ChatRequest, request: Request) -> StreamingResponse:
    log.info(
        "chat stream: thread=%s workspace=%s prompt_len=%d",
        req.thread_id, req.workspace, len(req.content or ""),
    )

    workspace = req.workspace or settings.workspace_root
    if not os.path.isabs(workspace):
        workspace = os.path.join(settings.workspace_root, workspace)
    os.makedirs(workspace, exist_ok=True)

    async def event_gen() -> Any:
        async for event in claudecode.run_claude(
            prompt=req.content,
            workspace_dir=workspace,
            session_id=req.thread_id,
            system_prompt=req.system_prompt,
        ):
            if await request.is_disconnected():
                log.info("client disconnected, stopping stream")
                break
            yield _event_to_sse(event)

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _event_to_sse(event: dict[str, Any]) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
