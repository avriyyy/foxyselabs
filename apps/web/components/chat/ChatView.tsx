"use client";

import { useEffect, useRef, useState } from "react";
import { PUBLIC_GATEWAY_URL } from "@/lib/api";
import type {
  AgentEvent,
  ChatEvent,
  ChatPart,
  LiveSession,
  Message,
  UiMessage,
} from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";
import { ActivityPanel } from "./ActivityPanel";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export function ChatView({ threadIdFromUrl }: { threadIdFromUrl?: Promise<string> }) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveSession, setLiveSession] = useState<LiveSession>({
    threadId: null,
    tools: [],
    mcpServers: [],
    promptTokens: 0,
    completionTokens: 0,
    running: false,
  });
  const [activityOpen, setActivityOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!threadIdFromUrl) {
      setThreadId(null);
      return;
    }
    threadIdFromUrl.then((id) => {
      if (id && id !== "new") setThreadId(id);
    });
  }, [threadIdFromUrl]);

  // Load thread messages on threadId change
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${PUBLIC_GATEWAY_URL}/api/threads/${threadId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load thread");
        const data = await res.json();
        if (cancelled) return;
        const loaded: UiMessage[] = (data.messages || []).map((m: Message) => ({
          id: m.id,
          role: m.role === "user" ? "user" : "assistant",
          parts: [{ kind: "text", content: m.content }],
          model: m.model_used || undefined,
          prompt_tokens: m.prompt_tokens || undefined,
          completion_tokens: m.completion_tokens || undefined,
          createdAt: m.created_at,
        }));
        setMessages(loaded);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  // Auto-scroll: only if user is already near the bottom
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (dist < 120) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streaming]);

  function appendPart(asstId: string, part: ChatPart) {
    setMessages((curr) =>
      curr.map((m) =>
        m.id === asstId
          ? {
              ...m,
              parts: [...m.parts, part],
            }
          : m
      )
    );
  }

  function appendText(asstId: string, text: string) {
    if (!text) return;
    setMessages((curr) =>
      curr.map((m) => {
        if (m.id !== asstId) return m;
        const parts = [...m.parts];
        const last = parts[parts.length - 1];
        // coalesce adjacent text deltas
        if (last && last.kind === "text") {
          parts[parts.length - 1] = { kind: "text", content: last.content + text };
        } else {
          parts.push({ kind: "text", content: text });
        }
        return { ...m, parts };
      })
    );
  }

  function appendThinking(asstId: string, content: string) {
    if (!content) return;
    setMessages((curr) =>
      curr.map((m) => {
        if (m.id !== asstId) return m;
        const parts = [...m.parts];
        const last = parts[parts.length - 1];
        if (last && last.kind === "event" && last.event.kind === "thinking_delta") {
          parts[parts.length - 1] = {
            kind: "event",
            event: { ...last.event, content: last.event.content + content },
          };
        } else {
          parts.push({
            kind: "event",
            event: { kind: "thinking_delta", content },
          });
        }
        return { ...m, parts };
      })
    );
  }

  function updateLastEvent(
    asstId: string,
    predicate: (e: ChatEvent) => boolean,
    updater: (e: ChatEvent) => ChatEvent
  ) {
    setMessages((curr) =>
      curr.map((m) => {
        if (m.id !== asstId) return m;
        const parts: ChatPart[] = m.parts.map((p) => {
          if (p.kind !== "event") return p;
          if (predicate(p.event)) {
            return { kind: "event" as const, event: updater(p.event) };
          }
          return p;
        });
        return { ...m, parts };
      })
    );
  }

  function setLastEvent(asstId: string, event: ChatEvent) {
    setMessages((curr) =>
      curr.map((m) => {
        if (m.id !== asstId) return m;
        const parts = [...m.parts];
        // For text_delta / thinking_delta, use specialized appenders that
        // coalesce with the previous one.
        if (event.kind === "text_delta") {
          appendText(asstId, event.delta);
          return m;
        }
        if (event.kind === "thinking_delta") {
          appendThinking(asstId, event.content);
          return m;
        }
        // For tool_end, try to merge with matching tool_start; otherwise
        // append a new event.
        if (event.kind === "tool_end") {
          const idx = m.parts.findIndex(
            (p) =>
              p.kind === "event" &&
              p.event.kind === "tool_start" &&
              p.event.id === event.id
          );
          if (idx >= 0) {
            parts[idx] = { kind: "event", event };
            return { ...m, parts };
          }
          parts.push({ kind: "event", event });
          return { ...m, parts };
        }
        // Other events: append. The renderer will group.
        parts.push({ kind: "event", event });
        return { ...m, parts };
      })
    );
  }

  function applyEvent(
    ev: AgentEvent,
    asstId: string,
    setResolvedThread: (id: string) => void
  ) {
    switch (ev.type) {
      case "thread.start":
        setResolvedThread(ev.thread_id);
        setLiveSession((s) => ({
          ...s,
          threadId: ev.thread_id,
          startedAt: Date.now(),
          running: true,
          promptTokens: 0,
          completionTokens: 0,
          lastError: undefined,
        }));
        break;

      case "init":
        setLiveSession((s) => ({
          ...s,
          model: ev.model,
          tools: ev.tools || [],
          mcpServers: ev.mcp_servers || [],
        }));
        break;

      case "message.assistant":
        appendText(asstId, ev.delta);
        break;

      case "thinking.start":
        // start a fresh thinking block (close any prior open block)
        updateLastEvent(
          asstId,
          (e) => e.kind === "thinking_delta",
          (e) =>
            e.kind === "thinking_delta" ? { ...e, complete: true } : e
        );
        setLastEvent(asstId, { kind: "thinking_delta", content: "" });
        break;

      case "thinking.delta":
        appendThinking(asstId, ev.content);
        break;

      case "thinking.end":
        updateLastEvent(
          asstId,
          (e) => e.kind === "thinking_delta",
          (e) =>
            e.kind === "thinking_delta" ? { ...e, complete: true } : e
        );
        break;

      case "tool.start":
        setLastEvent(asstId, {
          kind: "tool_start",
          id: ev.id,
          name: ev.name,
          server: ev.server,
          input: ev.input,
        });
        break;

      case "tool.progress":
        // for Bash: append to the matching shell buffer; we model this
        // as a tool_start with growing input is not ideal, so instead we
        // store as a special event the renderer will merge.
        setMessages((curr) =>
          curr.map((m) => {
            if (m.id !== asstId) return m;
            const idx = m.parts.findIndex(
              (p) =>
                p.kind === "event" &&
                p.event.kind === "tool_start" &&
                p.event.id === ev.id
            );
            if (idx < 0) return m;
            const ts = m.parts[idx];
            if (ts.kind !== "event" || ts.event.kind !== "tool_start") return m;
            const buffer = (ts.event as ChatEvent & { __shellBuffer?: string })
              .__shellBuffer || "";
            const newEv: ChatEvent = {
              ...ts.event,
              __shellBuffer: buffer + ev.chunk,
            } as ChatEvent;
            const parts: ChatPart[] = [...m.parts];
            parts[idx] = { kind: "event" as const, event: newEv };
            return { ...m, parts };
          })
        );
        break;

      case "tool.end":
        setLastEvent(asstId, {
          kind: "tool_end",
          id: ev.id,
          output: ev.output,
          status: (ev.status as "running" | "success" | "error") || "success",
          durationMs: ev.duration_ms,
        });
        break;

      case "file.read":
        // informational; renderer ignores (file read tool is rendered
        // via the matching tool_start/tool_end pair).
        break;

      case "file.edit":
        // informational; same.
        break;

      case "shell.start":
        setLastEvent(asstId, {
          kind: "tool_start",
          id: ev.id,
          name: "Bash",
          input: { command: ev.command },
        });
        break;

      case "shell.output":
        // The agent emits shell_start + shell.output + shell.end. The
        // ChatView setLastEvent handler maps shell.start to a tool_start
        // (name=Bash) above. shell.output updates the tool_start's
        // __shellBuffer so the final tool_end will carry the output.
        setMessages((curr) =>
          curr.map((m) => {
            if (m.id !== asstId) return m;
            const idx = m.parts.findIndex(
              (p) =>
                p.kind === "event" &&
                p.event.kind === "tool_start" &&
                p.event.id === ev.id
            );
            if (idx < 0) return m;
            const ts = m.parts[idx];
            if (ts.kind !== "event" || ts.event.kind !== "tool_start") return m;
            const buffer = (ts.event as ChatEvent & { __shellBuffer?: string })
              .__shellBuffer || "";
            const newEv: ChatEvent = {
              ...ts.event,
              __shellBuffer: buffer + ev.chunk,
            } as ChatEvent;
            const parts: ChatPart[] = [...m.parts];
            parts[idx] = { kind: "event" as const, event: newEv };
            return { ...m, parts };
          })
        );
        break;

      case "shell.end":
        // convert to a tool_end so the renderer shows it as a shell card
        setMessages((curr) =>
          curr.map((m) => {
            if (m.id !== asstId) return m;
            const idx = m.parts.findIndex(
              (p) =>
                p.kind === "event" &&
                p.event.kind === "tool_start" &&
                p.event.id === ev.id
            );
            const ts = idx >= 0 ? m.parts[idx] : null;
            const buffer =
              ts && ts.kind === "event" && ts.event.kind === "tool_start"
                ? (ts.event as ChatEvent & { __shellBuffer?: string })
                    .__shellBuffer || ""
                : "";
            const newEv: ChatEvent = {
              kind: "tool_end",
              id: ev.id,
              output: buffer,
              status: ev.exit_code === 0 ? "success" : "error",
              durationMs: ev.duration_ms,
            };
            const parts: ChatPart[] = [...m.parts];
            if (idx >= 0) {
              parts[idx] = { kind: "event" as const, event: newEv };
            } else {
              parts.push({ kind: "event" as const, event: newEv });
            }
            return { ...m, parts };
          })
        );
        break;

      case "ask_user":
        setLastEvent(asstId, {
          kind: "ask_user",
          id: ev.id,
          question: ev.question,
          options: ev.options,
        });
        break;

      case "usage":
        setMessages((curr) =>
          curr.map((m) =>
            m.id === asstId
              ? {
                  ...m,
                  model: ev.model || m.model,
                  prompt_tokens: ev.prompt_tokens,
                  completion_tokens: ev.completion_tokens,
                }
              : m
          )
        );
        setLiveSession((s) => ({
          ...s,
          model: ev.model || s.model,
          promptTokens: ev.prompt_tokens || s.promptTokens,
          completionTokens: ev.completion_tokens || s.completionTokens,
        }));
        break;

      case "thread.end":
        setMessages((curr) =>
          curr.map((m) =>
            m.id === asstId ? { ...m, pending: false } : m
          )
        );
        setLiveSession((s) => ({ ...s, running: false }));
        break;

      case "error":
        setError(`${ev.code}: ${ev.message}`);
        setLiveSession((s) => ({
          ...s,
          lastError: { code: ev.code, message: ev.message },
          running: false,
        }));
        break;
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    setError(null);

    const userMsg: UiMessage = {
      id: `tmp-u-${Date.now()}`,
      role: "user",
      parts: [{ kind: "text", content: text.trim() }],
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);

    const asstId = `tmp-a-${Date.now()}`;
    setMessages((m) => [
      ...m,
      {
        id: asstId,
        role: "assistant",
        parts: [],
        pending: true,
      },
    ]);
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${PUBLIC_GATEWAY_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId || undefined,
          content: text.trim(),
        }),
        signal: ctrl.signal,
      });

      if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "setup_required") {
          window.location.href = "/setup";
          return;
        }
      }
      if (!res.ok || !res.body) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let resolvedThreadId = threadId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const event = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const line = event.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          const payload = line.slice(6);
          try {
            const ev = JSON.parse(payload) as AgentEvent;
            applyEvent(ev, asstId, (id) => {
              if (!resolvedThreadId && id) {
                resolvedThreadId = id;
                setThreadId(id);
                window.history.replaceState(null, "", `/chat/${id}`);
                window.dispatchEvent(new CustomEvent("foxy:threads-changed"));
              }
            });
          } catch {
            // ignore malformed
          }
        }
      }
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
      }
    } finally {
      setMessages((curr) =>
        curr.map((m) => (m.id === asstId ? { ...m, pending: false } : m))
      );
      setStreaming(false);
      setLiveSession((s) => ({ ...s, running: false }));
      abortRef.current = null;
      window.dispatchEvent(new CustomEvent("foxy:threads-changed"));
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  return (
    <section className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-14 px-5 border-b border-white/5 flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-pink-neon animate-pulse" />
        <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon">
          {threadId ? "Thread" : "New chat"}
        </p>
        {streaming && (
          <span className="ml-auto font-label-mono text-[0.55rem] uppercase tracking-widest text-text-subtle">
            streaming
          </span>
        )}
        <button
          onClick={() => setActivityOpen((v) => !v)}
          className={`ml-auto px-2.5 py-1 text-[0.6rem] font-label-mono uppercase tracking-widest border transition-colors ${
            activityOpen
              ? "border-pink-neon/50 text-pink-neon"
              : "border-white/10 text-text-subtle hover:text-on-surface hover:border-white/20"
          }`}
          title="Toggle activity panel"
        >
          Activity
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Body */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 md:px-16 py-6 scrollbar-thin"
        >
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <EmptyState onPromptClick={(p) => sendMessage(p)} disabled={streaming} />
            ) : (
              <MessageList messages={messages} />
            )}
            {error && (
              <p className="mt-4 text-error text-[0.75rem] font-label-mono tracking-wider px-3 py-2 bg-error-container/20 border border-error/30">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Activity panel */}
        {activityOpen && (
          <ActivityPanel session={liveSession} onClose={() => setActivityOpen(false)} />
        )}
      </div>

      <div className="border-t border-white/5 p-4 md:px-16">
        <div className="max-w-3xl mx-auto">
          <InputBar onSend={sendMessage} onStop={stop} streaming={streaming} />
        </div>
      </div>
    </section>
  );
}
