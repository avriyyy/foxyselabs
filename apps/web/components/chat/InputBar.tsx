"use client";

import { useState } from "react";
import { IconSend, IconStop } from "@/components/Icons";

export function InputBar({
  onSend,
  onStop,
  streaming,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
}) {
  const [text, setText] = useState("");

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() || streaming) return;
    onSend(text);
    setText("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={submit} className="relative">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Send a message. Enter to send, Shift+Enter for newline."
        rows={1}
        disabled={streaming}
        className="field-input w-full resize-none pr-14 py-3.5 text-[0.85rem] max-h-40"
        style={{ minHeight: "52px" }}
      />
      {streaming ? (
        <button
          type="button"
          onClick={onStop}
          className="absolute right-2.5 bottom-2.5 w-9 h-9 bg-surface-container-high border border-pink-neon/40 text-pink-neon hover:bg-pink-neon/10 transition-colors flex items-center justify-center"
          aria-label="Stop"
        >
          <IconStop size={12} />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!text.trim()}
          className="absolute right-2.5 bottom-2.5 w-9 h-9 bg-pink-neon text-on-primary hover:bg-primary-container transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Send"
        >
          <IconSend size={14} />
        </button>
      )}
    </form>
  );
}
