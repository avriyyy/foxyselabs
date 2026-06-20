"use client";

import { useEffect, useRef, useState } from "react";
import { PUBLIC_GATEWAY_URL } from "@/lib/api";
import type { AgentEvent, Message } from "@/lib/types";
import { EmptyState } from "./EmptyState";
import { MessageList } from "./MessageList";
import { InputBar } from "./InputBar";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  model?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  createdAt?: string;
};

export function ChatView({ threadIdFromUrl }: { threadIdFromUrl?: Promise<string> }) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          content: m.content,
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    setError(null);

    const userMsg: UiMessage = {
      id: `tmp-u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);

    const asstId = `tmp-a-${Date.now()}`;
    setMessages((m) => [
      ...m,
      { id: asstId, role: "assistant", content: "", pending: true },
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
      let asstContent = "";
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
            handleEvent(
              ev,
              asstId,
              (delta) => {
                asstContent += delta;
                setMessages((curr) =>
                  curr.map((m) => (m.id === asstId ? { ...m, content: asstContent } : m))
                );
              },
              (id) => {
                if (!resolvedThreadId && id) {
                  resolvedThreadId = id;
                  setThreadId(id);
                  window.history.replaceState(null, "", `/chat/${id}`);
                  window.dispatchEvent(new CustomEvent("foxy:threads-changed"));
                }
              },
              (model, pt, ct) => {
                setMessages((curr) =>
                  curr.map((m) =>
                    m.id === asstId
                      ? { ...m, model, prompt_tokens: pt, completion_tokens: ct, pending: false }
                      : m
                  )
                );
                window.dispatchEvent(new CustomEvent("foxy:threads-changed"));
              },
              (err) => setError(err)
            );
          } catch {
            // ignore
          }
        }
      }

      setMessages((curr) =>
        curr.map((m) => (m.id === asstId ? { ...m, pending: false } : m))
      );
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
      }
      setMessages((curr) =>
        curr.map((m) => (m.id === asstId ? { ...m, pending: false } : m))
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  return (
    <section className="flex-1 flex flex-col min-w-0">
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
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-16 py-6 scrollbar-thin">
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

      <div className="border-t border-white/5 p-4 md:px-16">
        <div className="max-w-3xl mx-auto">
          <InputBar onSend={sendMessage} onStop={stop} streaming={streaming} />
        </div>
      </div>
    </section>
  );
}

function handleEvent(
  ev: AgentEvent,
  asstId: string,
  appendDelta: (delta: string) => void,
  setResolvedThread: (id: string) => void,
  setUsage: (model: string, prompt: number, completion: number) => void,
  setError: (msg: string) => void
) {
  switch (ev.type) {
    case "thread.start":
      setResolvedThread(ev.thread_id);
      break;
    case "message.assistant":
      appendDelta(ev.delta);
      break;
    case "usage":
      setUsage(
        ev.model || "claude",
        ev.prompt_tokens || 0,
        ev.completion_tokens || 0
      );
      break;
    case "error":
      setError(`${ev.code}: ${ev.message}`);
      break;
    case "thread.end":
      break;
  }
}
