"""Workspace setup helpers.

For Sprint 1 of the Claude Code pivot we use a shared workspace directory
bound to the host. Per-thread isolation will be added in Sprint 3
(per-thread Docker container with --add-dir).
"""

from __future__ import annotations

import os
import shutil
from pathlib import Path

from .config import settings


def ensure_workspace(user_id: str | None = None) -> str:
    """Return the workspace path for a user, creating it if missing."""
    if user_id:
        path = Path(settings.workspace_root) / user_id
    else:
        path = Path(settings.workspace_root) / "default"
    path.mkdir(parents=True, exist_ok=True)
    return str(path)


def resolve_workspace(workspace: str | None, user_id: str | None = None) -> str:
    """Resolve a workspace identifier to a host path.

    If `workspace` is an absolute path, return it (validated).
    Otherwise treat it as a subdirectory under the workspace root.
    """
    if workspace and os.path.isabs(workspace):
        os.makedirs(workspace, exist_ok=True)
        return workspace
    return ensure_workspace(user_id)


def is_under_root(path: str) -> bool:
    """Safety check: path is under the configured workspace root."""
    root = os.path.realpath(settings.workspace_root)
    target = os.path.realpath(path)
    return target == root or target.startswith(root + os.sep)
