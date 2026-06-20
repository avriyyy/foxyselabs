"""FoxyseLabs AI Agent service entry point.

Drives the Claude Code CLI as a subprocess and streams its output to
the gateway as SSE events.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import chat, health
from .config import settings


logging.basicConfig(
    level=settings.log_level.upper(),
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    log.info(
        "agent starting on port %d (claude=%s model=%s workspace=%s)",
        settings.agent_port,
        settings.claude_code_path,
        settings.claude_model,
        settings.workspace_root,
    )
    yield
    log.info("agent shutting down")


app = FastAPI(
    title="FoxyseLabs Agent",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router)
