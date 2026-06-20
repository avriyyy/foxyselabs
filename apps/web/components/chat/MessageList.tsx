"use client";

import { useMemo } from "react";
import { IconLoader } from "../Icons";
import type { ChatEvent, ChatPart, UiMessage } from "@/lib/types";
import { ThinkingBlock } from "./ThinkingBlock";
import {
  AskUserCard,
  ErrorEventCard,
  FileEditCard,
  FileReadCard,
  ShellRunCard,
  ToolCallCard,
} from "./EventCards";

export function MessageList({ messages }: { messages: UiMessage[] }) {
  return (
    <div className="space-y-5">
      {messages.map((m) => (
        <MessageBubble key={m.id} msg={m} />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: UiMessage }) {
  const isUser = msg.role === "user";
  const time = msg.createdAt
    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] md:max-w-[78%]`}>
        {isUser ? (
          <UserBubble text={extractText(msg.parts)} time={time} />
        ) : (
          <AssistantBubble msg={msg} time={time} />
        )}
      </div>
    </div>
  );
}

function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <>
      <div className="px-4 py-2.5 md:px-5 md:py-3 text-[0.85rem] leading-relaxed whitespace-pre-wrap bg-pink-neon/15 border border-pink-neon/30 text-on-surface">
        {text}
      </div>
      <p className="text-[0.6rem] font-mono text-text-subtle mt-1 text-right">{time}</p>
    </>
  );
}

function AssistantBubble({ msg, time }: { msg: UiMessage; time: string }) {
  // Group tool_start with its matching tool_end so the renderer can
  // decide which specialized card to show (FileRead, FileEdit, ShellRun,
  // or generic ToolCallCard).
  const groups = useMemo(() => groupParts(msg.parts), [msg.parts]);
  const showFooter = !msg.pending;
  const isEmpty = msg.parts.length === 0;

  return (
    <>
      <div className="space-y-0">
        {isEmpty && msg.pending && <PendingSkeleton />}
        {groups.map((g, i) => (
          <GroupRenderer key={i} group={g} pending={!!msg.pending} />
        ))}
      </div>
      {showFooter && (
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <p className="text-[0.6rem] font-mono text-text-subtle">{time}</p>
          {msg.model && (
            <p className="text-[0.6rem] font-mono text-text-subtle">· {msg.model}</p>
          )}
          {msg.prompt_tokens !== undefined && msg.completion_tokens !== undefined && (
            <p className="text-[0.6rem] font-mono text-text-subtle">
              · {msg.prompt_tokens + msg.completion_tokens} tokens
            </p>
          )}
        </div>
      )}
    </>
  );
}

function PendingSkeleton() {
  return (
    <div className="px-4 py-3 bg-surface-container-low border border-white/5 inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-pink-neon animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-pink-neon animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-pink-neon animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

type Group =
  | { kind: "text"; content: string }
  | { kind: "thinking"; event: Extract<ChatEvent, { kind: "thinking_delta" }> }
  | {
      kind: "tool";
      name: string;
      server?: string;
      input?: unknown;
      output?: unknown;
      status: "running" | "success" | "error";
      durationMs?: number;
    }
  | { kind: "ask_user"; event: Extract<ChatEvent, { kind: "ask_user" }> }
  | { kind: "error"; event: Extract<ChatEvent, { kind: "error" }> };

function groupParts(parts: ChatPart[]): Group[] {
  const out: Group[] = [];
  // map from tool id -> group index in out
  const toolIndex = new Map<string, number>();

  for (const part of parts) {
    if (part.kind === "text") {
      if (part.content) {
        // coalesce adjacent text
        const last = out[out.length - 1];
        if (last && last.kind === "text") {
          out[out.length - 1] = { kind: "text", content: last.content + part.content };
        } else {
          out.push({ kind: "text", content: part.content });
        }
      }
      continue;
    }
    const ev = part.event;
    if (ev.kind === "thinking_delta") {
      const last = out[out.length - 1];
      if (last && last.kind === "thinking") {
        out[out.length - 1] = {
          kind: "thinking",
          event: { ...last.event, content: last.event.content + ev.content, complete: ev.complete ?? last.event.complete },
        };
      } else {
        out.push({ kind: "thinking", event: ev });
      }
      continue;
    }
    if (ev.kind === "tool_start") {
      const g: Group = {
        kind: "tool",
        name: ev.name,
        server: ev.server,
        input: ev.input,
        output: undefined,
        status: "running",
      };
      out.push(g);
      toolIndex.set(ev.id, out.length - 1);
      continue;
    }
    if (ev.kind === "tool_end") {
      const idx = toolIndex.get(ev.id);
      if (idx !== undefined) {
        const g = out[idx] as Extract<Group, { kind: "tool" }>;
        out[idx] = {
          ...g,
          output: ev.output,
          status: ev.status,
          durationMs: ev.durationMs,
        };
      } else {
        // tool_end without matching start (e.g. shell collapsed into tool_end)
        out.push({
          kind: "tool",
          name: "Tool",
          output: ev.output,
          status: ev.status,
          durationMs: ev.durationMs,
        });
      }
      continue;
    }
    if (ev.kind === "ask_user") {
      out.push({ kind: "ask_user", event: ev });
      continue;
    }
    if (ev.kind === "error") {
      out.push({ kind: "error", event: ev });
      continue;
    }
    // init, text_delta, file_read, file_edit, shell_start, shell_output,
    // shell_end — all auxiliary, already merged into tool groups by the
    // ChatView. Skip here.
  }

  return out;
}

function GroupRenderer({ group, pending }: { group: Group; pending: boolean }) {
  switch (group.kind) {
    case "text":
      return (
        <p className="text-[0.85rem] text-on-surface leading-relaxed whitespace-pre-wrap break-words mb-2 last:mb-0">
          {group.content}
          {pending && (
            <span className="inline-block w-1.5 h-3.5 bg-pink-neon ml-0.5 align-middle animate-pulse" />
          )}
        </p>
      );
    case "thinking":
      return <ThinkingBlock event={group.event} />;
    case "tool":
      return <ToolRenderer group={group} />;
    case "ask_user":
      return <AskUserCard event={group.event} />;
    case "error":
      return <ErrorEventCard event={group.event} />;
  }
}

function ToolRenderer({ group }: { group: Extract<Group, { kind: "tool" }> }) {
  const input = group.input as Record<string, unknown> | undefined;
  const filePath = typeof input?.file_path === "string" ? input.file_path : null;
  const command = typeof input?.command === "string" ? input.command : null;

  // Bash → ShellRunCard
  if (group.name === "Bash" && command) {
    return (
      <ShellRunCard
        command={command}
        output={typeof group.output === "string" ? group.output : undefined}
        status={group.status}
        durationMs={group.durationMs}
      />
    );
  }

  // Read → FileReadCard
  if (group.name === "Read" && filePath) {
    return (
      <FileReadCard
        path={filePath}
        output={group.output}
        status={group.status}
      />
    );
  }

  // Edit / Write / MultiEdit → FileEditCard
  if ((group.name === "Edit" || group.name === "Write" || group.name === "MultiEdit") && filePath) {
    return (
      <FileEditCard
        path={filePath}
        action={group.name === "Write" ? "create" : "update"}
        output={group.output}
        status={group.status}
      />
    );
  }

  // Generic tool
  return (
    <ToolCallCard
      name={group.name}
      input={group.input}
      output={group.output}
      status={group.status}
      durationMs={group.durationMs}
      server={group.server}
    />
  );
}

function extractText(parts: ChatPart[]): string {
  return parts
    .filter((p) => p.kind === "text")
    .map((p) => (p as { kind: "text"; content: string }).content)
    .join("\n");
}
