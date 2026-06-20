# FoxyseLabs

> Self-hosted AI Agent platform. Claude Desktop for the web.

A browser-based AI Agent that can read your files, run shell commands, browse the web, and complete complex multi-step tasks. Supports the Model Context Protocol (MCP), so you can extend it with the same `.mcpb` extension bundles used by Claude Desktop.

MIT licensed. Bring your own API key (BYOK). Deploy on a single VPS.

## Status

**Sprint 0 — Monorepo baseline.**

| Sprint | Status |
| --- | --- |
| S0 — Cleanup + monorepo baseline | done |
| S1 — MVP chat (Next.js 15 + Go gateway + Python agent, OpenAI) | planned |
| S2 — Multi-provider + auth UI + workspace shell | planned |
| S3 — Real-time activity stream + per-thread sandbox + built-in tools | planned |
| S4 — MCP + `.mcpb` installer | planned |
| S5 — RAG + polish + v1.0.0 release | planned |

## Architecture

```
apps/
  web/         Next.js 15 frontend (port 3000, public)
  gateway/     Go (Gin) — auth, files, MCP orchestrator, SSE relay (port 8080, internal)
  agent/       Python (FastAPI + LangGraph + LiteLLM) — agent loop (port 8000, internal)
packages/
  schemas/     Shared JSON Schema (TypeScript + Python)
data/          Mounted volumes (gitignored)
  workspaces/  per-user workspaces
  extensions/  installed .mcpb extensions
  postgres/
  redis/
```

## Quick start (development)

Prerequisites: Docker, Node 20+, pnpm 9+, Python 3.11+ (for local agent dev).

```bash
# 1. Clone
git clone https://github.com/foxyselabs/foxyselabs.git
cd foxyselabs

# 2. Configure
cp .env.example .env
# edit .env: set POSTGRES_PASSWORD, JWT_SECRET, ENCRYPTION_KEY, OPENAI_API_KEY

# 3. Start infrastructure
pnpm docker:up

# 4. (Sprint 1+) start each service
pnpm dev:gateway
pnpm dev:agent
pnpm dev:web
```

Then open `http://localhost:3000`.

## Deployment (production, single VPS)

```bash
# 1. Provision Ubuntu 22.04+ VPS
# 2. Install Docker + Docker Compose
# 3. Clone, configure .env, then:
docker compose up -d --build
```

Your agent is now reachable at `http://<VPS_IP>:3000`.

## Tech stack

- **Frontend**: Next.js 15, React 19, Tailwind v4, AI SDK
- **Gateway**: Go 1.22+, Gin, pgx, go-redis, mark3labs/mcp-go
- **Agent**: Python 3.11+, FastAPI, LangGraph, LiteLLM, mcp, langchain-mcp-adapters
- **DB**: PostgreSQL 16 + pgvector, Redis 7
- **Sandbox**: per-thread Docker containers, bind-mounted workspace

## License

MIT. See [LICENSE](./LICENSE).
