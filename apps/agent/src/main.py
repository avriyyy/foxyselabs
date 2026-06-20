"""FoxyseLabs AI Agent service entry point.

Drives the Claude Code CLI as a subprocess and streams its output to
the gateway as SSE events.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import chat, health, workspace
from .config import settings
from .sandbox import sandbox_manager


logging.basicConfig(
    level=settings.log_level.upper(),
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    log.info(
        "agent starting on port %d (claude=%s model=%s workspace=%s sandbox=%s)",
        settings.agent_port,
        settings.claude_code_path,
        settings.claude_model,
        settings.workspace_root,
        "on" if settings.sandbox_enabled else "off",
    )
    if settings.sandbox_enabled:
        available = sandbox_manager.is_available()
        log.info("docker available: %s", available)
        if available:
            await sandbox_manager.start_cleanup_loop()
    yield
    log.info("agent shutting down")
    if settings.sandbox_enabled:
        await sandbox_manager.stop_cleanup_loop()


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
app.include_router(workspace.router)
