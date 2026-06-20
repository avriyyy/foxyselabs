export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  default_provider: string;
  default_model: string;
  has_openai_key: boolean;
  has_anthropic_key: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  expires_at: number;
}

export interface Thread {
  id: string;
  title: string | null;
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

// Agent SSE event types
export type AgentEvent =
  | { type: "thread.start"; thread_id: string }
  | { type: "message.assistant"; delta: string }
  | { type: "thinking.start" }
  | { type: "thinking.delta"; content: string }
  | { type: "thinking.end" }
  | { type: "tool.start"; id: string; name: string; server?: string; input: unknown }
  | { type: "tool.progress"; id: string; chunk: string }
  | { type: "tool.end"; id: string; output: unknown; duration_ms: number }
  | { type: "file.read"; path: string; lines: number }
  | { type: "file.edit"; path: string; action: "create" | "update" | "delete"; diff?: string }
  | { type: "shell.start"; id: string; command: string }
  | { type: "shell.output"; id: string; stream: "stdout" | "stderr"; chunk: string }
  | { type: "shell.end"; id: string; exit_code: number; duration_ms: number }
  | { type: "ask_user"; id: string; question: string; options?: string[] }
  | { type: "usage"; prompt_tokens: number; completion_tokens: number; model?: string }
  | { type: "thread.end"; reason: "done" | "cancelled" | "error" }
  | { type: "error"; code: string; message: string };
