"""
Claude Code subprocess adapter.

Spawns the Claude Code CLI and yields SSE-ready event dicts. When
sandbox is enabled, the CLI runs inside a per-thread Docker container
managed by SandboxManager. When disabled, it runs directly on the
agent host (useful for local dev).
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from collections.abc import AsyncIterator
from typing import Any

from .config import settings
from .sandbox import sandbox_manager

log = logging.getLogger(__name__)


async def run_claude(
    prompt: str,
    workspace_dir: str,
    session_id: str | None = None,
    model: str | None = None,
    system_prompt: str | None = None,
    add_dirs: list[str] | None = None,
) -> AsyncIterator[dict[str, Any]]:
    """
    Spawn claude and stream its events.

    Args:
        prompt: The user message to send.
        workspace_dir: The thread's working directory.
        session_id: Optional session ID to resume / continue.
        model: Model name (e.g. "mimo-v2-flash").
        system_prompt: Optional system prompt to append.
        add_dirs: Additional directories to allow the agent to access.

    Yields:
        SSE-ready dicts (see AgentEvent type).
    """
    sid = session_id or str(uuid.uuid4())
    chosen_model = model or settings.claude_model

    cmd = [
        settings.claude_code_path,
        "--print",
        "--output-format",
        "stream-json",
        "--verbose",
        "--bare",
        "--model",
        chosen_model,
        "--session-id",
        sid,
    ]
    if add_dirs:
        for d in add_dirs:
            cmd += ["--add-dir", d]
    if system_prompt:
        cmd += ["--append-system-prompt", system_prompt]
    cmd += [prompt]

    log.info("calling %s model=%s session=%s", settings.claude_code_path, chosen_model, sid[:8])

    # ----------------------------------------------------------------
    # Sandbox mode: run claude inside a per-thread Docker container
    # ----------------------------------------------------------------
    if settings.sandbox_enabled and sandbox_manager.is_available():
        async for ev in _run_in_sandbox(
            sid=sid,
            cmd=cmd,
            workspace_dir=workspace_dir,
            model=chosen_model,
        ):
            yield ev
        return

    # ----------------------------------------------------------------
    # Local mode: run claude directly as a subprocess on the host.
    # Used in dev (FOX_SANDBOX_ENABLED=false) or if Docker is unavailable.
    # ----------------------------------------------------------------
    os.makedirs(workspace_dir, exist_ok=True)
    env = _build_local_env()
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=workspace_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
    except FileNotFoundError:
        yield {"type": "error", "code": "claude_not_found",
               "message": f"claude binary not found at {settings.claude_code_path}"}
        return
    except Exception as exc:  # noqa: BLE001
        log.exception("failed to spawn claude")
        yield {"type": "error", "code": "spawn_failed", "message": str(exc)}
        return

    yield {"type": "thread.start", "thread_id": sid}
    stderr_task = asyncio.create_task(_drain_stderr(proc))
    final_text, final_usage, final_model, error_event = (
        await _read_and_translate(proc, settings.claude_timeout_sec)
    )
    stderr_text = await stderr_task
    if error_event and not final_text:
        yield error_event
    elif proc.returncode != 0 and not final_text:
        yield {"type": "error", "code": f"exit_{proc.returncode}",
               "message": stderr_text.strip()[:500] or f"claude exited {proc.returncode}"}
    yield {"type": "usage",
           "prompt_tokens": final_usage.get("prompt_tokens", 0),
           "completion_tokens": final_usage.get("completion_tokens", 0),
           "model": final_model}
    yield {"type": "thread.end",
           "reason": "done" if proc.returncode == 0 else "error"}


# --------------------------------------------------------------------
# Sandbox execution path
# --------------------------------------------------------------------

async def _run_in_sandbox(
    sid: str,
    cmd: list[str],
    workspace_dir: str,
    model: str,
) -> AsyncIterator[dict[str, Any]]:
    """Run claude inside a per-thread Docker sandbox."""
    yield {"type": "thread.start", "thread_id": sid}
    # Start (or get) the container
    try:
        info = await asyncio.to_thread(
            sandbox_manager.get_or_create, sid, workspace_dir
        )
    except Exception as exc:  # noqa: BLE001
        log.exception("failed to start sandbox")
        yield {"type": "error", "code": "sandbox_start_failed", "message": str(exc)}
        yield {"type": "thread.end", "reason": "error"}
        return

    # The exec output from claude CLI is a stream of JSON lines. Use
    # exec_stream and split on newlines. The real `system.init` event
    # from claude code will surface the actual model + tools.
    final_text = ""
    final_usage: dict[str, Any] = {}
    final_model = model

    try:
        # exec_stream is a sync generator. Wrap in to_thread and yield.
        def run():
            return list(
                sandbox_manager.exec_stream(sid, cmd, workdir="/workspace")
            )

        chunks = await asyncio.to_thread(run)
    except Exception as exc:  # noqa: BLE001
        log.exception("sandbox exec failed")
        yield {"type": "error", "code": "sandbox_exec_failed", "message": str(exc)}
        yield {"type": "thread.end", "reason": "error"}
        return

    # Combine stdout into lines. `chunks` is whatever the SDK yielded
    # from `exec_stream` — each element is a (label, bytes) tuple like
    # ('stdout', b'...') or ('stderr', b'...'). We only care about
    # stdout here.
    buffer = b""
    for entry in chunks:
        if entry is None:
            continue
        if isinstance(entry, tuple) and len(entry) >= 2:
            label, payload = entry[0], entry[1]
            if label == "stdout" and payload:
                buffer += payload if isinstance(payload, bytes) else str(payload).encode("utf-8", "replace")
        elif isinstance(entry, bytes):
            buffer += entry
        elif isinstance(entry, str):
            buffer += entry.encode("utf-8", "replace")
        else:
            log.warning("unexpected chunk type from docker exec: %r", type(entry))
    text = buffer.decode("utf-8", errors="replace")
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            ev = json.loads(line)
        except json.JSONDecodeError:
            log.warning("non-JSON from sandbox claude: %r", line[:200])
            continue
        async for out_ev in _translate_event(ev):
            if out_ev.get("type") == "message.assistant":
                d = out_ev.get("delta", "")
                if isinstance(d, str):
                    final_text += d
            if out_ev.get("type") == "usage":
                final_usage = out_ev
                final_model = out_ev.get("model", model)
            yield out_ev

    # The `result` event from claude code already emitted a usage event
    # with the final token counts. Just close out the thread.
    yield {"type": "thread.end", "reason": "done"}


# --------------------------------------------------------------------
# Local subprocess helpers
# --------------------------------------------------------------------

def _build_local_env() -> dict[str, str]:
    env = os.environ.copy()
    env["CLAUDE_CODE_SIMPLE"] = "1"
    for k in ("ANTHROPIC_API_KEY", "ANTHROPIC_BASE_URL", "ANTHROPIC_AUTH_TOKEN"):
        v = os.environ.get(k)
        if v:
            env[k] = v
    return env


async def _drain_stderr(proc: asyncio.subprocess.Process) -> str:
    chunks: list[str] = []
    if proc.stderr is None:
        return ""
    while True:
        line = await proc.stderr.readline()
        if not line:
            break
        chunks.append(line.decode("utf-8", errors="replace").rstrip())
    return "\n".join(chunks)


async def _read_and_translate(
    proc: asyncio.subprocess.Process,
    timeout: int,
) -> tuple[str, dict, str, dict | None]:
    final_text = ""
    final_usage: dict[str, Any] = {}
    final_model = ""
    error_event: dict | None = None
    try:
        assert proc.stdout is not None
        while True:
            line = await asyncio.wait_for(proc.stdout.readline(), timeout=timeout)
            if not line:
                break
            text = line.decode("utf-8", errors="replace").strip()
            if not text:
                continue
            try:
                ev = json.loads(text)
            except json.JSONDecodeError:
                log.warning("non-JSON line from claude: %r", text[:200])
                continue
            async for out in _translate_event(ev):
                if out.get("type") == "message.assistant":
                    d = out.get("delta")
                    if isinstance(d, str):
                        final_text += d
                if out.get("type") == "usage":
                    final_usage = out
                    final_model = out.get("model", final_model)
                if out.get("type") == "error" and not error_event:
                    error_event = out
    except asyncio.TimeoutError:
        proc.kill()
    finally:
        try:
            await asyncio.wait_for(proc.wait(), timeout=10)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
    return final_text, final_usage, final_model, error_event


# --------------------------------------------------------------------
# Event translation
# --------------------------------------------------------------------

async def _translate_event(ev: dict[str, Any]) -> AsyncIterator[dict[str, Any]]:
    et = ev.get("type")
    sub = ev.get("subtype")

    if et == "system" and sub == "init":
        yield {
            "type": "init",
            "model": ev.get("model"),
            "tools": ev.get("tools", []),
            "session_id": ev.get("session_id"),
            "mcp_servers": ev.get("mcp_servers", []),
        }
        return

    if et == "system" and sub == "thinking_tokens":
        return

    if et == "system" and sub == "api_retry":
        yield {
            "type": "error",
            "code": f"api_retry_{ev.get('attempt', 0)}",
            "message": f"upstream auth error (attempt {ev.get('attempt')}): {ev.get('error', 'unknown')}",
        }
        return

    if et == "assistant":
        msg = ev.get("message", {}) or {}
        content = msg.get("content", []) or []
        for block in content:
            btype = block.get("type")
            if btype == "thinking":
                thinking = block.get("thinking", "")
                if thinking:
                    yield {"type": "thinking.delta", "content": thinking}
            elif btype == "text":
                text = block.get("text", "")
                if text:
                    yield {"type": "message.assistant", "delta": text}
            elif btype == "tool_use":
                name = block.get("name", "tool")
                tool_id = block.get("id", str(uuid.uuid4()))
                yield {
                    "type": "tool.start",
                    "id": tool_id,
                    "name": name,
                    "input": block.get("input", {}),
                }
        return

    if et == "user":
        msg = ev.get("message", {}) or {}
        content = msg.get("content", []) or []
        for block in content:
            if block.get("type") == "tool_result":
                tool_id = block.get("tool_use_id", "tool")
                is_err = block.get("is_error", False)
                out = block.get("content", "")
                if isinstance(out, list):
                    out = "\n".join(
                        c.get("text", str(c)) if isinstance(c, dict) else str(c) for c in out
                    )
                yield {
                    "type": "tool.end",
                    "id": tool_id,
                    "output": out,
                    "status": "error" if is_err else "success",
                }
        return

    if et == "result":
        usage = ev.get("usage", {}) or {}
        prompt_tokens = usage.get("input_tokens", 0)
        completion_tokens = usage.get("output_tokens", 0)
        yield {
            "type": "usage",
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "model": ev.get("modelUsage", {}) and next(iter(ev["modelUsage"].keys()), settings.claude_model),
        }
        return

    log.debug("unhandled claude event: type=%s subtype=%s", et, sub)
