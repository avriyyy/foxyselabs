export interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Thread {
  id: string;
  user_id: string;
  title: string | null;
  workspace_path: string;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  tool_name?: string | null;
  model_used?: string | null;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  created_at: string;
}

export interface ThreadDetail {
  thread: Thread;
  messages: Message[];
}

// ============================================================================
// Activity events from the agent (mirrors apps/agent/src/claudecode.py)
// ============================================================================

export type ToolStatus = "running" | "success" | "error";

export type ChatEvent =
  // Initial info from system.init
  | { kind: "init"; model: string; tools: string[]; mcpServers: string[]; sessionId?: string }
  // Streaming assistant text delta
  | { kind: "text_delta"; delta: string }
  // Extended thinking content (MiMo / Claude)
  | { kind: "thinking_delta"; content: string; complete?: boolean }
  // Generic tool call
  | {
      kind: "tool_start";
      id: string;
      name: string;
      server?: string; // 'builtin' | 'mcp:<name>'
      input: unknown;
    }
  | {
      kind: "tool_end";
      id: string;
      output: unknown;
      status: ToolStatus;
      durationMs?: number;
    }
  // File operations (decoded from Read/Write/Edit tool args)
  | { kind: "file_read"; path: string; lines?: number }
  | { kind: "file_edit"; path: string; action: "create" | "update" | "delete"; diff?: string }
  // Shell command
  | { kind: "shell_start"; id: string; command: string; description?: string }
  | { kind: "shell_output"; id: string; stream: "stdout" | "stderr"; chunk: string }
  | { kind: "shell_end"; id: string; exitCode?: number; durationMs?: number }
  // Ask user (human-in-the-loop, future)
  | { kind: "ask_user"; id: string; question: string; options?: string[] }
  // Errors
  | { kind: "error"; code: string; message: string; recoverable?: boolean };

// A "part" is the ordered unit rendered in the message list.
// Either a text segment (accumulated text) or a rendered event card.
export type ChatPart =
  | { kind: "text"; content: string }
  | { kind: "event"; event: ChatEvent };

// UI-side message representation. parts[] is the chronological list of
// what was streamed. text content from the assistant is also collapsed
// into a single text part for compactness.
export type UiMessage = {
  id: string;
  role: "user" | "assistant";
  parts: ChatPart[];
  model?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  createdAt?: string;
  pending?: boolean;
};

// Live session metadata for the activity panel
export type LiveSession = {
  threadId: string | null;
  model?: string;
  tools: string[];
  mcpServers: string[];
  startedAt?: number;
  // rolling counters updated as events arrive
  promptTokens: number;
  completionTokens: number;
  // last error
  lastError?: { code: string; message: string };
  // True while a stream is in flight
  running: boolean;
};

// The raw SSE event type from /api/chat/stream
export type AgentEvent =
  | { type: "init"; model: string; tools: string[]; session_id?: string; mcp_servers?: string[] }
  | { type: "thread.start"; thread_id: string }
  | { type: "message.assistant"; delta: string }
  | { type: "thinking.start" }
  | { type: "thinking.delta"; content: string }
  | { type: "thinking.end" }
  | { type: "tool.start"; id: string; name: string; server?: string; input: unknown }
  | { type: "tool.progress"; id: string; chunk: string }
  | { type: "tool.end"; id: string; output: unknown; duration_ms: number; status?: string }
  | { type: "file.read"; path: string; lines: number }
  | { type: "file.edit"; path: string; action: "create" | "update" | "delete"; diff?: string }
  | { type: "shell.start"; id: string; command: string }
  | { type: "shell.output"; id: string; stream: "stdout" | "stderr"; chunk: string }
  | { type: "shell.end"; id: string; exit_code: number; duration_ms: number }
  | { type: "ask_user"; id: string; question: string; options?: string[] }
  | { type: "usage"; prompt_tokens: number; completion_tokens: number; model?: string }
  | { type: "thread.end"; reason: "done" | "cancelled" | "error" }
  | { type: "error"; code: string; message: string };
