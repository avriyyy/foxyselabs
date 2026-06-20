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

// Agent / Claude Code SSE event types
// (mirrors apps/agent/src/claudecode.py)
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
