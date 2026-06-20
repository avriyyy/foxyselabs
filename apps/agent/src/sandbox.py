"""Per-thread sandbox management.

Spawns a foxyselabs-sandbox container per active thread, with the
thread's workspace directory bind-mounted. Claude Code runs inside
the container via `docker exec`. Idle containers are cleaned up
periodically.

Requires the Docker socket to be mounted into the agent container:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
"""

from __future__ import annotations

import asyncio
import logging
import os
import shutil
import time
from dataclasses import dataclass, field

import docker
from docker.errors import NotFound

from .config import settings

log = logging.getLogger(__name__)


@dataclass
class ContainerInfo:
    container_id: str
    thread_id: str
    workspace_path: str
    started_at: float
    last_used: float


class SandboxManager:
    """Singleton-style manager; one process, one Docker client."""

    IMAGE_NAME = "foxyselabs-sandbox:latest"
    LABEL_PREFIX = "foxyselabs"
    IDLE_TIMEOUT_SEC = 600  # 10 min
    CLEANUP_INTERVAL_SEC = 60

    def __init__(self) -> None:
        self._client: docker.DockerClient | None = None
        self._containers: dict[str, ContainerInfo] = {}
        self._lock = asyncio.Lock()
        self._cleanup_task: asyncio.Task | None = None

    @property
    def client(self) -> docker.DockerClient:
        if self._client is None:
            try:
                self._client = docker.from_env()
            except Exception as exc:
                log.error("docker.from_env failed: %s", exc)
                raise
        return self._client

    def is_available(self) -> bool:
        """Check if Docker is reachable."""
        try:
            self.client.ping()
            return True
        except Exception as exc:
            log.warning("docker not available: %s", exc)
            return False

    async def start_cleanup_loop(self) -> None:
        """Run idle cleanup periodically."""
        if self._cleanup_task is not None:
            return
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())

    async def stop_cleanup_loop(self) -> None:
        if self._cleanup_task is not None:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
            self._cleanup_task = None

    async def _cleanup_loop(self) -> None:
        while True:
            try:
                self.cleanup_idle()
            except Exception as exc:  # noqa: BLE001
                log.exception("idle cleanup failed: %s", exc)
            await asyncio.sleep(self.CLEANUP_INTERVAL_SEC)

    # ------------------------------------------------------------------
    # Container lifecycle
    # ------------------------------------------------------------------

    def _container_name(self, thread_id: str) -> str:
        # docker container names: [a-zA-Z0-9][a-zA-Z0-9_.-]+
        safe = "".join(c if c.isalnum() or c in "-_." else "-" for c in thread_id)
        return f"foxy-sbx-{safe[:48]}"

    def _agent_to_host_path(self, agent_path: str) -> str:
        """Translate an agent-relative workspace path to a host path.

        The agent sees /data/workspaces/* via its own volume mount. When
        we ask dockerd (running on the host) to bind-mount that same
        directory, we must give it the path that exists on the host.
        """
        agent_root = settings.workspace_root.rstrip("/")
        host_root = settings.workspace_host_root.rstrip("/")
        if agent_path.startswith(agent_root):
            rel = agent_path[len(agent_root):]
            return host_root + rel
        # Path is not under the configured workspace root — assume it's
        # already a host path (best-effort).
        return agent_path

    def get_or_create(self, thread_id: str, workspace_path: str) -> ContainerInfo:
        """Return existing container for the thread, or start a new one."""
        existing = self._containers.get(thread_id)
        if existing:
            try:
                c = self.client.containers.get(existing.container_id)
                c.reload()
                if c.status in ("running", "created"):
                    existing.last_used = time.time()
                    return existing
            except NotFound:
                pass
            # stale entry; remove and recreate
            self._containers.pop(thread_id, None)

        os.makedirs(workspace_path, exist_ok=True)
        # Ensure the host dir is owned by the uid the container runs as
        # (sandbox uid 1001) so claude inside the container can write.
        try:
            shutil.chown(workspace_path, user=1001, group=1001)
        except (PermissionError, LookupError, KeyError):
            pass

        labels = {
            f"{self.LABEL_PREFIX}.component": "sandbox",
            f"{self.LABEL_PREFIX}.thread": thread_id,
        }
        # Translate agent-relative workspace path to host-relative path
        # so dockerd can resolve it. The agent sees /data/workspaces/* via
        # its own volume mount; dockerd (running on the host) needs the
        # path that exists on the host filesystem.
        host_workspace = self._agent_to_host_path(workspace_path)

        container = self.client.containers.run(
            self.IMAGE_NAME,
            command=["sleep", "infinity"],
            name=self._container_name(thread_id),
            detach=True,
            remove=False,  # we'll remove explicitly
            labels=labels,
            user="sandbox",
            working_dir="/workspace",
            environment={
                "ANTHROPIC_API_KEY": os.environ.get("ANTHROPIC_API_KEY", ""),
                "ANTHROPIC_BASE_URL": os.environ.get("ANTHROPIC_BASE_URL", ""),
                "CLAUDE_CODE_SIMPLE": "1",
                "HOME": "/home/sandbox",
            },
            volumes={
                host_workspace: {"bind": "/workspace", "mode": "rw"},
            },
            mem_limit=settings.sandbox_memory_limit,
            nano_cpus=int(settings.sandbox_cpu_limit * 1e9),
            # No `network` arg: defaults to the standard bridge network.
        )
        info = ContainerInfo(
            container_id=container.id,
            thread_id=thread_id,
            workspace_path=workspace_path,
            started_at=time.time(),
            last_used=time.time(),
        )
        self._containers[thread_id] = info
        log.info("started sandbox %s for thread=%s workspace=%s",
                 container.short_id, thread_id[:8], workspace_path)
        return info

    def exec(
        self,
        thread_id: str,
        cmd: list[str],
        workdir: str = "/workspace",
        env: dict | None = None,
        timeout: int = 1800,
    ) -> tuple[int, bytes, bytes]:
        """Run a command in the thread's sandbox container.

        Returns (exit_code, stdout, stderr).
        """
        info = self._containers.get(thread_id)
        if info is None:
            raise RuntimeError(f"no sandbox for thread {thread_id}")
        container = self.client.containers.get(info.container_id)
        info.last_used = time.time()

        exec_env = {
            "ANTHROPIC_API_KEY": os.environ.get("ANTHROPIC_API_KEY", ""),
            "ANTHROPIC_BASE_URL": os.environ.get("ANTHROPIC_BASE_URL", ""),
            "CLAUDE_CODE_SIMPLE": "1",
            "HOME": "/home/sandbox",
        }
        if env:
            exec_env.update(env)

        exec_result = container.exec_run(
            cmd=cmd,
            workdir=workdir,
            environment=exec_env,
            user="sandbox",
            stdout=True,
            stderr=True,
            stream=False,
            demux=False,
        )
        output = exec_result.output
        # output is bytes (since demux=False)
        if isinstance(output, tuple):
            stdout, stderr = output
        else:
            stdout = output or b""
            stderr = b""
        return exec_result.exit_code, stdout, stderr

    def exec_stream(
        self,
        thread_id: str,
        cmd: list[str],
        workdir: str = "/workspace",
        env: dict | None = None,
    ):
        """Async generator yielding (event_type, bytes) for streaming exec.

        event_type is 'stdout' or 'stderr'.
        """
        info = self._containers.get(thread_id)
        if info is None:
            raise RuntimeError(f"no sandbox for thread {thread_id}")
        container = self.client.containers.get(info.container_id)
        info.last_used = time.time()

        exec_env = {
            "ANTHROPIC_API_KEY": os.environ.get("ANTHROPIC_API_KEY", ""),
            "ANTHROPIC_BASE_URL": os.environ.get("ANTHROPIC_BASE_URL", ""),
            "CLAUDE_CODE_SIMPLE": "1",
            "HOME": "/home/sandbox",
        }
        if env:
            exec_env.update(env)

        # exec_run with stream=True returns a tuple (exit_code, generator).
        # Iterate carefully: the first item is exit_code (int), subsequent
        # items are (stdout, stderr) tuples from the demuxed stream.
        result = container.exec_run(
            cmd=cmd,
            workdir=workdir,
            environment=exec_env,
            user="sandbox",
            stdout=True,
            stderr=True,
            stream=True,
            demux=True,
        )
        # result is a named tuple (ExitCode, Output) where Output is an
        # iterator of (stdout, stderr) chunks. Iterate only the Output.
        for chunk in result[1]:
            if chunk is None:
                continue
            # chunk is normally a (stdout_bytes, stderr_bytes) tuple, but
            # in some docker SDK versions it may include additional items.
            # Be defensive.
            try:
                stdout, stderr, *_ = chunk
            except (TypeError, ValueError):
                # chunk isn't iterable / unpackable
                if isinstance(chunk, bytes):
                    yield "stdout", chunk
                continue
            if stdout:
                yield "stdout", stdout
            if stderr:
                yield "stderr", stderr

    def stop(self, thread_id: str) -> bool:
        info = self._containers.pop(thread_id, None)
        if info is None:
            return False
        try:
            c = self.client.containers.get(info.container_id)
            c.stop(timeout=5)
            c.remove(force=True)
            log.info("stopped sandbox %s for thread=%s",
                     c.short_id, thread_id[:8])
        except NotFound:
            pass
        except Exception as exc:  # noqa: BLE001
            log.warning("failed to stop sandbox %s: %s", info.container_id, exc)
        return True

    def list_active(self) -> list[ContainerInfo]:
        return list(self._containers.values())

    def cleanup_idle(self) -> int:
        """Remove containers idle longer than IDLE_TIMEOUT_SEC."""
        now = time.time()
        removed = 0
        for thread_id, info in list(self._containers.items()):
            if now - info.last_used > self.IDLE_TIMEOUT_SEC:
                if self.stop(thread_id):
                    removed += 1
        if removed:
            log.info("cleaned up %d idle sandbox(es)", removed)
        return removed

    def list_workspace_files(self, thread_id: str, rel_path: str = "") -> list[dict]:
        """List files in the workspace using the sandbox container.

        Returns a list of {name, path, is_dir, size} dicts.
        """
        info = self._containers.get(thread_id)
        if info is None:
            raise RuntimeError(f"no sandbox for thread {thread_id}")
        target = "/workspace"
        if rel_path:
            target = f"/workspace/{rel_path.lstrip('/')}"
        # safe path
        if ".." in rel_path.split("/"):
            raise ValueError("invalid path")
        exit_code, stdout, stderr = self.exec(
            thread_id,
            ["find", target, "-mindepth", "1", "-maxdepth", "4",
             "-printf", "%y|%s|%p\\n"],
            workdir="/workspace",
        )
        if exit_code != 0:
            log.warning("find failed in sandbox: %s", stderr.decode("utf-8", "replace"))
            return []
        out = []
        for line in stdout.decode("utf-8", "replace").splitlines():
            try:
                ftype, size, path = line.split("|", 2)
            except ValueError:
                continue
            name = path.rsplit("/", 1)[-1]
            is_dir = ftype == "d"
            try:
                size_int = int(size) if size.isdigit() else 0
            except ValueError:
                size_int = 0
            # strip the /workspace/ prefix from displayed path
            rel = path[len("/workspace/"):] if path.startswith("/workspace/") else path
            out.append({
                "name": name,
                "path": rel,
                "is_dir": is_dir,
                "size": size_int,
            })
        # sort dirs first then files
        out.sort(key=lambda f: (not f["is_dir"], f["name"].lower()))
        return out

    def read_file(self, thread_id: str, rel_path: str) -> str:
        """Read a text file from the workspace."""
        if ".." in rel_path.split("/"):
            raise ValueError("invalid path")
        exit_code, stdout, stderr = self.exec(
            thread_id,
            ["cat", f"/workspace/{rel_path.lstrip('/')}"],
            workdir="/workspace",
        )
        if exit_code != 0:
            raise FileNotFoundError(f"file not found: {rel_path}: {stderr.decode('utf-8','replace')}")
        return stdout.decode("utf-8", "replace")


# Module-level singleton
sandbox_manager = SandboxManager()
