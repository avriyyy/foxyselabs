FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Minimal system deps for Claude Code CLI in the sandbox
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl git jq python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code@2.1.183

# Create non-root user for the sandbox
RUN useradd -r -u 1001 -m -d /home/sandbox sandbox && \
    mkdir -p /workspace && chown -R sandbox:sandbox /workspace

USER sandbox
WORKDIR /workspace
CMD ["sleep", "infinity"]
