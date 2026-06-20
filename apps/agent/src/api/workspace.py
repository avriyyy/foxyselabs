"""Workspace + sandbox introspection endpoints (used by the web UI)."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from ..sandbox import sandbox_manager

log = logging.getLogger(__name__)
router = APIRouter()


@router.get("/v1/sandboxes")
async def list_sandboxes():
    """List currently running sandbox containers (admin/debug endpoint)."""
    items = sandbox_manager.list_active()
    return {
        "data": [
            {
                "thread_id": i.thread_id,
                "container_id_short": i.container_id[:12],
                "workspace_path": i.workspace_path,
                "started_at": i.started_at,
                "last_used": i.last_used,
            }
            for i in items
        ]
    }


@router.delete("/v1/sandboxes/{thread_id}")
async def stop_sandbox(thread_id: str):
    """Stop a sandbox container for a thread."""
    stopped = sandbox_manager.stop(thread_id)
    return {"ok": stopped}


@router.get("/v1/sandboxes/{thread_id}/files")
async def list_files(thread_id: str, path: str = ""):
    """List files in the thread's workspace sandbox."""
    try:
        items = sandbox_manager.list_workspace_files(thread_id, path)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:  # noqa: BLE001
        log.warning("list_workspace_files failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    return {"data": items, "path": path}


@router.get("/v1/sandboxes/{thread_id}/files/content")
async def read_file(thread_id: str, path: str):
    """Read a text file from the thread's workspace sandbox."""
    try:
        content = sandbox_manager.read_file(thread_id, path)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"path": path, "content": content}
