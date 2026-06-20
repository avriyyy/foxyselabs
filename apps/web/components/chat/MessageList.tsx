"use client";

import { IconLoader } from "@/components/Icons";

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
      <div className="max-w-[85%] md:max-w-[78%]">
        <div
          className={`px-4 py-2.5 md:px-5 md:py-3 text-[0.85rem] leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-pink-neon/15 border border-pink-neon/30 text-on-surface"
              : "bg-surface-container-low border border-outline-variant text-on-surface"
          }`}
        >
          {msg.content}
          {msg.pending && !msg.content && (
            <div className="flex gap-1.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-neon animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-pink-neon animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-pink-neon animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
          {msg.pending && msg.content && (
            <span className="inline-block w-1.5 h-3 bg-pink-neon ml-0.5 animate-pulse align-middle" />
          )}
        </div>
        <div className={`flex items-center gap-2 mt-1 ${isUser ? "justify-end" : "justify-start"}`}>
          <p className="text-[0.6rem] font-mono text-text-subtle">{time}</p>
          {!isUser && msg.model && (
            <p className="text-[0.6rem] font-mono text-text-subtle">
              · {msg.model}
              {msg.prompt_tokens !== undefined && msg.completion_tokens !== undefined && (
                <> · {msg.prompt_tokens + msg.completion_tokens} tokens</>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
