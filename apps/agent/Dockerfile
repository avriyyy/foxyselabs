FROM node:20-bookworm

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# System deps (curl, jq, python3 + pip, docker CLI for sandbox management)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    curl jq ca-certificates docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI globally. The agent spawns it as a subprocess
# (when sandbox is disabled, dev mode) or inside a per-thread sandbox
# container (when enabled).
RUN npm install -g @anthropic-ai/claude-code@2.1.183 && \
    claude --version

# Python deps — FastAPI + docker SDK (for sandbox management)
RUN pip install --break-system-packages \
    "fastapi>=0.115.0" "uvicorn[standard]>=0.32.0" \
    "pydantic>=2.9.0" "pydantic-settings>=2.6.0" \
    "sse-starlette>=2.1.0" "httpx>=0.27.0" \
    "docker>=7.0.0"

COPY src ./src

# Create workspace dir (will be bind-mounted).
# Note: agent runs as root so it can access the Docker socket.
# The sandbox containers themselves run as non-root 'sandbox' user.
RUN mkdir -p /data/workspaces
# Remove any 'USER' line — the agent needs root to talk to docker.sock.
# (The user 'appuser' was created earlier but we don't switch to it.)

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/healthz || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
