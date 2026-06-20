"use client";

import { useState } from "react";
import {
  IconAlert,
  IconBolt,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconEdit,
  IconFile,
  IconGlobe,
  IconHammer,
  IconList,
  IconLoader,
  IconRead,
  IconSearch,
  IconTerminal,
  IconWrite,
  IconCheck,
  IconX,
} from "../Icons";
import type { ChatEvent, ToolStatus } from "@/lib/types";

// ----------------------------------------------------------------------------
// Tool icon resolution
// ----------------------------------------------------------------------------

type IconKey =
  | "Read"
  | "Write"
  | "Edit"
  | "MultiEdit"
  | "Bash"
  | "Grep"
  | "Glob"
  | "WebFetch"
  | "WebSearch"
  | "NotebookEdit"
  | "Task"
  | "TodoWrite"
  | "default";

const TOOL_META: Record<
  IconKey,
  { icon: typeof IconFile; label: string; color: string }
> = {
  Read: { icon: IconRead, label: "Read file", color: "text-pink-neon" },
  Write: { icon: IconWrite, label: "Write file", color: "text-pink-neon" },
  Edit: { icon: IconEdit, label: "Edit file", color: "text-pink-neon" },
  MultiEdit: { icon: IconEdit, label: "Edit files", color: "text-pink-neon" },
  Bash: { icon: IconTerminal, label: "Run command", color: "text-pink-neon" },
  Grep: { icon: IconSearch, label: "Search text", color: "text-pink-neon" },
  Glob: { icon: IconList, label: "List files", color: "text-pink-neon" },
  WebFetch: { icon: IconGlobe, label: "Fetch URL", color: "text-pink-neon" },
  WebSearch: { icon: IconSearch, label: "Web search", color: "text-pink-neon" },
  NotebookEdit: { icon: IconEdit, label: "Notebook edit", color: "text-pink-neon" },
  Task: { icon: IconBolt, label: "Task", color: "text-pink-neon" },
  TodoWrite: { icon: IconList, label: "Update todo", color: "text-pink-neon" },
  default: { icon: IconHammer, label: "Tool", color: "text-pink-neon" },
};

export function getToolMeta(name: string) {
  return TOOL_META[name as IconKey] || { ...TOOL_META.default, label: name };
}

// ----------------------------------------------------------------------------
// Status badge
// ----------------------------------------------------------------------------

function StatusBadge({ status }: { status?: ToolStatus }) {
  if (!status || status === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[0.6rem] font-label-mono uppercase tracking-widest text-pink-neon">
        <IconLoader size={10} className="animate-spin" />
        running
      </span>
    );
  }
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 text-[0.6rem] font-label-mono uppercase tracking-widest text-success">
        <IconCheck size={10} /> done
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[0.6rem] font-label-mono uppercase tracking-widest text-error">
      <IconX size={10} /> error
    </span>
  );
}

// ----------------------------------------------------------------------------
// JSON pretty printer for tool input/output
// ----------------------------------------------------------------------------

function PrettyJSON({ value, collapsed = true }: { value: unknown; collapsed?: boolean }) {
  let text = "";
  try {
    text = JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }
  if (!text || text === "null" || text === "undefined") {
    return <span className="text-text-muted text-[0.7rem] font-mono">(empty)</span>;
  }
  const lines = text.split("\n");
  const truncated = collapsed && lines.length > 12;
  const display = truncated ? lines.slice(0, 12).join("\n") + "\n..." : text;

  return (
    <pre className="text-[0.72rem] text-on-surface-variant font-mono leading-relaxed whitespace-pre-wrap break-words">
      {display}
    </pre>
  );
}

function valueToString(v: unknown): string {
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

// ----------------------------------------------------------------------------
// ToolCallCard
// ----------------------------------------------------------------------------

/**
 * Generic tool call card. Renders the tool name, status, and collapsible
 * input/output bodies. Specialized cards (FileRead, FileEdit, ShellRun)
 * are rendered by matching on the tool name.
 */
export function ToolCallCard({
  name,
  input,
  output,
  status,
  durationMs,
  server,
}: {
  name: string;
  input: unknown;
  output?: unknown;
  status?: ToolStatus;
  durationMs?: number;
  server?: string;
}) {
  const meta = getToolMeta(name);
  const Icon = meta.icon;
  const [open, setOpen] = useState(false);
  const isRunning = !status || status === "running";
  const hasOutput = output !== undefined && output !== null;

  return (
    <div
      className={`my-2.5 border ${
        status === "error"
          ? "border-error/30 bg-error-container/10"
          : isRunning
            ? "border-pink-neon/30 bg-pink-neon/5"
            : "border-white/5 bg-surface-container-low"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <Icon size={14} className={`${meta.color} shrink-0`} />
        <span className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon">
          {meta.label}
        </span>
        {server && server !== "builtin" && (
          <span className="text-[0.55rem] font-mono text-text-subtle border border-white/10 px-1.5 py-0.5">
            {server}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-2.5">
          {durationMs !== undefined && (
            <span className="text-[0.6rem] font-mono text-text-muted">
              {durationMs < 1000
                ? `${durationMs}ms`
                : `${(durationMs / 1000).toFixed(1)}s`}
            </span>
          )}
          <StatusBadge status={status} />
          {hasOutput || input !== undefined ? (
            <span className="text-text-subtle">
              {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            </span>
          ) : null}
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2">
          {input !== undefined && (
            <div>
              <p className="text-[0.6rem] font-label-mono uppercase tracking-widest text-text-subtle mb-1">
                input
              </p>
              <PrettyJSON value={input} />
            </div>
          )}
          {hasOutput && (
            <div>
              <p className="text-[0.6rem] font-label-mono uppercase tracking-widest text-text-subtle mb-1">
                output
              </p>
              {status === "error" ? (
                <p className="text-[0.78rem] text-error font-mono whitespace-pre-wrap break-words">
                  {valueToString(output)}
                </p>
              ) : typeof output === "string" ? (
                <pre className="text-[0.78rem] text-on-surface font-mono whitespace-pre-wrap break-words">
                  {output}
                </pre>
              ) : (
                <PrettyJSON value={output} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// FileReadCard (specialized for Read tool)
// ----------------------------------------------------------------------------

export function FileReadCard({
  path,
  output,
  status,
}: {
  path: string;
  output?: unknown;
  status?: ToolStatus;
}) {
  const [open, setOpen] = useState(false);
  const isRunning = !status || status === "running";
  const filename = path.split("/").pop() || path;
  const dir = path.slice(0, path.length - filename.length);

  return (
    <div
      className={`my-2.5 border ${
        isRunning ? "border-pink-neon/30 bg-pink-neon/5" : "border-white/5 bg-surface-container-low"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <IconRead size={14} className="text-pink-neon shrink-0" />
        <span className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon">
          Read
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-1.5 text-[0.78rem] font-mono">
          <span className="text-on-surface truncate">{filename}</span>
          {dir && (
            <span className="text-text-muted truncate text-[0.7rem]">{dir}</span>
          )}
        </div>
        <StatusBadge status={status} />
        <span className="text-text-subtle">
          {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </span>
      </button>
      {open && output !== undefined && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          {typeof output === "string" ? (
            <pre className="text-[0.78rem] text-on-surface-variant font-mono leading-relaxed whitespace-pre-wrap break-words max-h-80 overflow-auto scrollbar-thin">
              {output}
            </pre>
          ) : (
            <PrettyJSON value={output} />
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// FileEditCard (specialized for Edit/Write/MultiEdit tool)
// ----------------------------------------------------------------------------

export function FileEditCard({
  path,
  action,
  output,
  status,
}: {
  path: string;
  action: "create" | "update" | "delete";
  output?: unknown;
  status?: ToolStatus;
}) {
  const [open, setOpen] = useState(action !== "create");
  const isRunning = !status || status === "running";
  const filename = path.split("/").pop() || path;
  const dir = path.slice(0, path.length - filename.length);
  const actionLabel =
    action === "create" ? "Create file" : action === "delete" ? "Delete file" : "Edit file";
  const ActionIcon = action === "create" ? IconWrite : action === "delete" ? IconX : IconEdit;

  // try to render a unified diff if output contains an old_str / new_str structure
  let diffLines: { kind: "add" | "del" | "ctx"; text: string }[] = [];
  if (typeof output === "string" && output.length > 0) {
    diffLines = [
      ...output.split("\n").map((l) => ({
        kind: (l.startsWith("+") ? "add" : l.startsWith("-") ? "del" : "ctx") as "add" | "del" | "ctx",
        text: l,
      })),
    ];
  }

  return (
    <div
      className={`my-2.5 border ${
        status === "error"
          ? "border-error/30 bg-error-container/10"
          : isRunning
            ? "border-pink-neon/30 bg-pink-neon/5"
            : "border-white/5 bg-surface-container-low"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <ActionIcon size={14} className="text-pink-neon shrink-0" />
        <span className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon">
          {actionLabel}
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-1.5 text-[0.78rem] font-mono">
          <span className="text-on-surface truncate">{filename}</span>
          {dir && (
            <span className="text-text-muted truncate text-[0.7rem]">{dir}</span>
          )}
        </div>
        <StatusBadge status={status} />
        <span className="text-text-subtle">
          {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-white/5">
          {diffLines.length > 0 ? (
            <div className="font-mono text-[0.74rem] leading-relaxed">
              {diffLines.map((l, i) => (
                <div
                  key={i}
                  className={`px-3 py-0.5 ${
                    l.kind === "add"
                      ? "bg-success/10 text-success"
                      : l.kind === "del"
                        ? "bg-error/10 text-error"
                        : "text-on-surface-variant"
                  }`}
                >
                  {l.text}
                </div>
              ))}
            </div>
          ) : output !== undefined ? (
            <pre className="px-3 py-2 text-[0.78rem] text-on-surface font-mono whitespace-pre-wrap break-words max-h-80 overflow-auto scrollbar-thin">
              {typeof output === "string" ? output : valueToString(output)}
            </pre>
          ) : isRunning ? (
            <div className="px-3 py-2 flex items-center gap-2 text-[0.75rem] text-text-subtle">
              <IconLoader size={12} /> applying changes...
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// ShellRunCard (specialized for Bash tool)
// ----------------------------------------------------------------------------

export function ShellRunCard({
  command,
  output,
  status,
  durationMs,
}: {
  command: string;
  output?: string;
  status?: ToolStatus;
  durationMs?: number;
}) {
  const [open, setOpen] = useState(true);
  const isRunning = !status || status === "running";

  return (
    <div
      className={`my-2.5 border ${
        status === "error"
          ? "border-error/30 bg-error-container/10"
          : isRunning
            ? "border-pink-neon/30 bg-pink-neon/5"
            : "border-white/5 bg-surface-container-low"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <IconTerminal size={14} className="text-pink-neon shrink-0" />
        <span className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon">
          Run
        </span>
        <code className="flex-1 min-w-0 truncate text-[0.78rem] text-on-surface font-mono">
          $ {command}
        </code>
        <span className="ml-auto inline-flex items-center gap-2.5">
          {durationMs !== undefined && (
            <span className="text-[0.6rem] font-mono text-text-muted">
              {durationMs < 1000
                ? `${durationMs}ms`
                : `${(durationMs / 1000).toFixed(1)}s`}
            </span>
          )}
          <StatusBadge status={status} />
          <span className="text-text-subtle">
            {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </span>
        </span>
      </button>
      {open && (
        <div className="border-t border-white/5 bg-[#0c0608] font-mono text-[0.74rem] leading-relaxed">
          {output && output.length > 0 ? (
            <pre className="px-3 py-2 text-on-surface whitespace-pre-wrap break-words max-h-80 overflow-auto scrollbar-thin">
              {output}
            </pre>
          ) : isRunning ? (
            <div className="px-3 py-2 flex items-center gap-2 text-text-subtle">
              <IconLoader size={12} /> running...
            </div>
          ) : (
            <div className="px-3 py-2 text-text-muted">(no output)</div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// ErrorEventCard
// ----------------------------------------------------------------------------

export function ErrorEventCard({ event }: { event: ChatEvent }) {
  if (event.kind !== "error") return null;
  return (
    <div className="my-2.5 border border-error/40 bg-error-container/15 px-3 py-2 flex items-start gap-2">
      <IconAlert size={14} className="text-error shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-error">
          {event.code}
        </p>
        <p className="text-[0.78rem] text-on-surface font-mono break-words">{event.message}</p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// AskUserCard (placeholder for human-in-the-loop, Sprint 3+)
// ----------------------------------------------------------------------------

export function AskUserCard({ event }: { event: ChatEvent }) {
  if (event.kind !== "ask_user") return null;
  return (
    <div className="my-2.5 border border-pink-neon/30 bg-pink-neon/5 px-3 py-2">
      <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon mb-1">
        Question
      </p>
      <p className="text-[0.85rem] text-on-surface mb-2">{event.question}</p>
      {event.options && event.options.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {event.options.map((opt) => (
            <button
              key={opt}
              className="px-2.5 py-1 text-[0.78rem] border border-pink-neon/30 text-pink-neon hover:bg-pink-neon/10 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
