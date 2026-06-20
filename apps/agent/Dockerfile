FROM node:20-bookworm

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# System deps (curl, jq for sandbox healthchecks, python3 + pip).
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    curl jq ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI globally. The agent will spawn it as a subprocess.
RUN npm install -g @anthropic-ai/claude-code@2.1.183 && \
    claude --version

# Python deps — FastAPI only, no LangGraph/LiteLLM needed.
RUN pip install --break-system-packages \
    "fastapi>=0.115.0" "uvicorn[standard]>=0.32.0" \
    "pydantic>=2.9.0" "pydantic-settings>=2.6.0" \
    "sse-starlette>=2.1.0" "httpx>=0.27.0"

COPY src ./src

# Drop privileges.
RUN useradd -r -u 1001 -m -d /home/appuser appuser && \
    mkdir -p /data/workspaces && \
    chown -R appuser:appuser /app /data
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8000/healthz || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
