"""
Claude Code subprocess adapter.

Spawns `claude --print --output-format stream-json --verbose` and yields
SSE-ready event dicts that match our AgentEvent protocol. Used by the
web frontend to render Claude Desktop-style activity.

Claude Code's stream-json event types we translate:
  - system.init            -> thread.start (with session_id)
  - system.thinking_tokens -> thinking.delta
  - system.api_retry       -> error
  - assistant.message      -> message.assistant (text or thinking content)
  - tool_use               -> tool.start
  - tool_result            -> tool.end
  - result                 -> usage + thread.end

See: https://docs.claude.com/en/docs/claude-code/cli-reference
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

log = logging.getLogger(__name__)

# Event types we emit to the gateway/web.
# Keep in sync with apps/web/lib/types.ts (AgentEvent union).


async def run_claude(
    prompt: str,
    workspace_dir: str,
    session_id: str | None = None,
    model: str | None = None,
    system_prompt: str | None = None,
    add_dirs: list[str] | None = None,
) -> AsyncIterator[dict[str, Any]]:
    """
    Spawn the `claude` CLI and stream events.

    Args:
        prompt: The user message to send.
        workspace_dir: The thread's working directory (must exist).
        session_id: Optional session ID to resume / continue. If None, a
            new session is started.
        model: Model name (e.g. "mimo-v2-flash"). Defaults to settings.
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
    if settings.claude_settings_file and os.path.exists(settings.claude_settings_file):
        cmd += ["--settings", settings.claude_settings_file]
    if add_dirs:
        for d in add_dirs:
            cmd += ["--add-dir", d]
    if system_prompt:
        cmd += ["--append-system-prompt", system_prompt]
    cmd += [prompt]

    log.info("spawning claude: session=%s model=%s workspace=%s", sid, chosen_model, workspace_dir)

    # Ensure workspace exists
    os.makedirs(workspace_dir, exist_ok=True)

    env = os.environ.copy()
    # Force the CLI to use only ANTHROPIC_API_KEY (no OAuth/keychain).
    env["CLAUDE_CODE_SIMPLE"] = "1"
    # Make sure ANTHROPIC_API_KEY / ANTHROPIC_BASE_URL are passed through
    # even if the container set them after we imported os.
    for k in ("ANTHROPIC_API_KEY", "ANTHROPIC_BASE_URL", "ANTHROPIC_AUTH_TOKEN"):
        v = os.environ.get(k)
        if v:
            env[k] = v

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=workspace_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
    except FileNotFoundError:
        log.error("claude binary not found at %s", settings.claude_code_path)
        yield {"type": "error", "code": "claude_not_found",
               "message": f"claude binary not found at {settings.claude_code_path}"}
        return
    except Exception as exc:  # noqa: BLE001
        log.exception("failed to spawn claude")
        yield {"type": "error", "code": "spawn_failed", "message": str(exc)}
        return

    # Emit thread.start immediately so the web can navigate to the thread URL.
    yield {"type": "thread.start", "thread_id": sid}

    # Read stderr in background to surface errors
    async def drain_stderr() -> str:
        chunks: list[str] = []
        if proc.stderr is None:
            return ""
        while True:
            line = await proc.stderr.readline()
            if not line:
                break
            chunks.append(line.decode("utf-8", errors="replace").rstrip())
        return "\n".join(chunks)

    stderr_task = asyncio.create_task(drain_stderr())

    final_text = ""
    final_usage: dict[str, Any] = {}
    final_model = chosen_model

    try:
        assert proc.stdout is not None
        while True:
            line = await asyncio.wait_for(
                proc.stdout.readline(), timeout=settings.claude_timeout_sec
            )
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
                # Track for finalization
                if out.get("type") == "message.assistant":
                    delta = out.get("delta")
                    if isinstance(delta, str):
                        final_text += delta
                if out.get("type") == "usage":
                    final_usage = out
                    if out.get("model"):
                        final_model = out["model"]
                yield out
    except asyncio.TimeoutError:
        log.error("claude timed out after %ss", settings.claude_timeout_sec)
        proc.kill()
        yield {"type": "error", "code": "timeout",
               "message": f"claude timed out after {settings.claude_timeout_sec}s"}
    finally:
        try:
            await asyncio.wait_for(proc.wait(), timeout=10)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()

        stderr_text = await stderr_task

    # Check exit code
    if proc.returncode != 0 and not final_text:
        log.error("claude exited %d, stderr: %s", proc.returncode, stderr_text[:500])
        yield {
            "type": "error",
            "code": f"exit_{proc.returncode}",
            "message": stderr_text.strip()[:500] or f"claude exited with code {proc.returncode}",
        }

    # Always emit final thread.end
    yield {
        "type": "usage",
        "prompt_tokens": final_usage.get("prompt_tokens", 0),
        "completion_tokens": final_usage.get("completion_tokens", 0),
        "model": final_model,
    }
    yield {"type": "thread.end", "reason": "done" if proc.returncode == 0 else "error"}


async def _translate_event(ev: dict[str, Any]) -> AsyncIterator[dict[str, Any]]:
    """
    Translate one Claude Code stream-json event to one or more of our
    AgentEvent dicts.
    """
    et = ev.get("type")
    sub = ev.get("subtype")

    if et == "system" and sub == "init":
        # Don't emit a duplicate thread.start — we already emitted one
        # from run_claude with the session ID we asked for. But forward
        # the model + tools so the UI can show them.
        yield {
            "type": "init",
            "model": ev.get("model"),
            "tools": ev.get("tools", []),
            "session_id": ev.get("session_id"),
            "mcp_servers": ev.get("mcp_servers", []),
        }
        return

    if et == "system" and sub == "thinking_tokens":
        # MiMo emits thinking content blocks; we surface them as thinking
        # deltas. The thinking_tokens events are internal accounting.
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
        # Usually tool_result blocks
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
        result_text = ev.get("result", "")
        # Emit the final text content (Claude Code returns the final
        # assistant text in the result event when not streaming).
        if result_text and result_text != final_text():
            # result_text may duplicate the streamed text; only emit if
            # we got nothing via assistant events.
            pass
        yield {
            "type": "usage",
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "model": ev.get("modelUsage", {}) and next(iter(ev["modelUsage"].keys()), settings.claude_model),
        }
        return

    # Unknown / unhandled — log and skip
    log.debug("unhandled claude event: type=%s subtype=%s", et, sub)


def final_text() -> str:
    """Helper used by _translate_event to dedupe result vs streamed text."""
    return ""
