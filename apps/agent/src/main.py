"""FoxyseLabs AI Agent service entry point."""

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
    log.info("agent starting on port %d (default provider=%s model=%s)",
             settings.agent_port, settings.default_provider, settings.default_model)
    yield
    log.info("agent shutting down")


app = FastAPI(
    title="FoxyseLabs Agent",
    version="0.1.0",
    lifespan=lifespan,
)

# Agent is internal — CORS limited to gateway origin. In practice the gateway
# calls us over the docker network and we don't expose this port publicly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router)
