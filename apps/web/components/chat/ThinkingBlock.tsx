"use client";

import { useState } from "react";
import { IconBrain, IconChevronDown, IconChevronUp, IconLoader } from "../Icons";
import type { ChatEvent } from "@/lib/types";

/**
 * Collapsible thinking block — Claude Desktop style.
 * Shows extended-thinking content from the model.
 */
export function ThinkingBlock({ event }: { event: ChatEvent }) {
  if (event.kind !== "thinking_delta") return null;
  const hasContent = event.content.length > 0;
  const isComplete = event.complete === true;
  const [open, setOpen] = useState(true);

  return (
    <div className="my-2.5 border border-white/5 bg-surface-container-low">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-white/5 transition-colors"
      >
        <IconBrain size={14} className="text-pink-neon shrink-0" />
        <span className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon">
          Thinking
        </span>
        {!isComplete && hasContent && (
          <span className="inline-flex items-center gap-1 text-[0.65rem] text-text-subtle font-mono">
            <span className="w-1 h-1 rounded-full bg-pink-neon animate-pulse" />
            streaming
          </span>
        )}
        {isComplete && hasContent && (
          <span className="text-[0.65rem] text-text-muted font-mono">
            {event.content.length} chars
          </span>
        )}
        <span className="ml-auto text-text-subtle">
          {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5">
          {hasContent ? (
            <pre className="text-[0.78rem] text-on-surface-variant font-mono leading-relaxed whitespace-pre-wrap break-words">
              {event.content}
            </pre>
          ) : (
            <div className="flex items-center gap-2 text-[0.75rem] text-text-subtle py-1">
              <IconLoader size={12} />
              <span>thinking...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
