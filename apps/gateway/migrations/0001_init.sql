-- ============================================================================
-- FoxyseLabs v2 — Initial Schema
-- Sprint 0 baseline. Self-hosted AI Agent platform.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(32)  NOT NULL DEFAULT 'user',
    is_admin        BOOLEAN     NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    -- BYOK encrypted at rest (AES-256-GCM, key from ENCRYPTION_KEY env)
    openai_api_key_encrypted     BYTEA,
    anthropic_api_key_encrypted  BYTEA,
    ollama_base_url              VARCHAR(512),
    default_provider  VARCHAR(32)  NOT NULL DEFAULT 'openai',
    default_model     VARCHAR(128) NOT NULL DEFAULT 'gpt-4o-mini',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- ----------------------------------------------------------------------------
-- sessions  (server-side session, opaque token)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(128) UNIQUE NOT NULL,
    user_agent  TEXT,
    ip          VARCHAR(64),
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ----------------------------------------------------------------------------
-- threads  (one thread = one conversation)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS threads (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title          VARCHAR(512),
    workspace_path TEXT NOT NULL DEFAULT '/data/workspaces/default',
    archived_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON threads(updated_at DESC);

-- ----------------------------------------------------------------------------
-- workspace_access  (which users can access which workspaces)
-- Admin can grant any user access to any workspace.
-- A workspace is identified by its filesystem path.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_access (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_path TEXT NOT NULL,
    can_read    BOOLEAN NOT NULL DEFAULT TRUE,
    can_write   BOOLEAN NOT NULL DEFAULT TRUE,
    granted_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, workspace_path)
);
CREATE INDEX IF NOT EXISTS idx_workspace_access_user_id ON workspace_access(user_id);

-- ----------------------------------------------------------------------------
-- messages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id           UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    role                VARCHAR(32) NOT NULL,   -- user | assistant | tool | system
    content             TEXT NOT NULL,
    tool_call_id        VARCHAR(128),
    tool_name           VARCHAR(255),
    tool_server         VARCHAR(255),           -- builtin | mcp:<name>
    tool_input          JSONB,
    tool_output         JSONB,
    model_used          VARCHAR(128),
    prompt_tokens       INTEGER,
    completion_tokens   INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_tool_call_id ON messages(tool_call_id);

-- ----------------------------------------------------------------------------
-- files  (workspace file metadata)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS files (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path          TEXT NOT NULL,
    name          VARCHAR(512) NOT NULL,
    mime_type     VARCHAR(255),
    size_bytes    BIGINT,
    is_directory  BOOLEAN NOT NULL DEFAULT FALSE,
    parent_path   TEXT,
    indexed_at    TIMESTAMPTZ,                  -- set when embedded for RAG
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, path)
);
CREATE INDEX IF NOT EXISTS idx_files_user_parent ON files(user_id, parent_path);

-- ----------------------------------------------------------------------------
-- embeddings  (RAG vector store, Sprint 5)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS embeddings (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id      UUID REFERENCES files(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chunk_index  INTEGER NOT NULL,
    content      TEXT NOT NULL,
    embedding    vector(384) NOT NULL,          -- sentence-transformers/all-MiniLM-L6-v2
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_file_id ON embeddings(file_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ----------------------------------------------------------------------------
-- extensions  (.mcpb installed, system-wide)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS extensions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(128) UNIQUE NOT NULL,
    version          VARCHAR(64)  NOT NULL,
    description      TEXT,
    author           VARCHAR(255),
    manifest         JSONB NOT NULL,
    install_path     TEXT NOT NULL,
    server_command   VARCHAR(512) NOT NULL,
    server_args      JSONB NOT NULL DEFAULT '[]'::jsonb,
    server_env       JSONB NOT NULL DEFAULT '{}'::jsonb,
    status           VARCHAR(32) NOT NULL DEFAULT 'stopped',  -- active | stopped | error
    last_error       TEXT,
    installed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_extensions_status ON extensions(status);

-- ----------------------------------------------------------------------------
-- mcp_servers  (runtime stdio process instances)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mcp_servers (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    extension_id  UUID NOT NULL REFERENCES extensions(id) ON DELETE CASCADE,
    pid           INTEGER,
    port          INTEGER,
    status        VARCHAR(32) NOT NULL DEFAULT 'stopped',  -- starting | running | stopped | crashed
    started_at    TIMESTAMPTZ,
    stopped_at    TIMESTAMPTZ,
    logs_path     TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_extension_id ON mcp_servers(extension_id);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_status ON mcp_servers(status);

-- ----------------------------------------------------------------------------
-- tool_invocations  (audit log setiap tool call)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tool_invocations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id     UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    message_id    UUID REFERENCES messages(id) ON DELETE SET NULL,
    tool_name     VARCHAR(255) NOT NULL,
    tool_server   VARCHAR(255),                          -- builtin | mcp:<extension_name>
    tool_input    JSONB,
    tool_output   JSONB,
    status        VARCHAR(32) NOT NULL DEFAULT 'running',  -- running | success | error
    duration_ms   INTEGER,
    error         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tool_invocations_thread_id ON tool_invocations(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tool_invocations_status ON tool_invocations(status);

-- ----------------------------------------------------------------------------
-- file_operations  (audit log untuk file_edit events di activity panel)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS file_operations (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id          UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    tool_invocation_id UUID REFERENCES tool_invocations(id) ON DELETE SET NULL,
    path               TEXT NOT NULL,
    action             VARCHAR(32) NOT NULL,             -- create | update | delete | read
    diff               TEXT,
    content_before     TEXT,
    content_after      TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_file_operations_thread_id ON file_operations(thread_id, created_at);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at       ON users;
DROP TRIGGER IF EXISTS trg_threads_updated_at     ON threads;
DROP TRIGGER IF EXISTS trg_files_updated_at       ON files;
DROP TRIGGER IF EXISTS trg_extensions_updated_at  ON extensions;

CREATE TRIGGER trg_users_updated_at      BEFORE UPDATE ON users      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_threads_updated_at    BEFORE UPDATE ON threads    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_files_updated_at      BEFORE UPDATE ON files      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_extensions_updated_at BEFORE UPDATE ON extensions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
