"use client";

import { IconChat, IconSearch, IconFile, IconTerminal, IconBolt } from "@/components/Icons";

const PROMPTS = [
  { icon: IconChat, label: "Explain a concept", prompt: "Explain the difference between process and thread, in a way a junior developer would understand." },
  { icon: IconFile, label: "Summarize a file", prompt: "I have a file at ./README.md. Read it and give me a 5-bullet summary." },
  { icon: IconTerminal, label: "Debug a script", prompt: "Help me debug a shell script that exits with code 137. Walk me through the likely causes." },
  { icon: IconSearch, label: "Research a topic", prompt: "What are the trade-offs between using SQLite vs Postgres for a single-user self-hosted app?" },
  { icon: IconBolt, label: "Refactor code", prompt: "Show me a Python refactor of a 200-line script into clean functions, with type hints." },
  { icon: IconChat, label: "Ask anything", prompt: "What's a good way to learn Rust as a Python developer?" },
];

export function EmptyState({ onPromptClick, disabled }: { onPromptClick: (p: string) => void; disabled?: boolean }) {
  return (
    <div className="py-12 md:py-20 flex flex-col items-center gap-8">
      <div className="text-center max-w-lg">
        <h1 className="text-display-md font-display-md text-on-surface mb-3">
          How can I help you today?
        </h1>
        <p className="text-[0.85rem] text-on-surface-variant">
          I can read files, run commands, search the web, and complete multi-step tasks. Pick a starter, or ask anything.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        {PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={disabled}
            onClick={() => onPromptClick(p.prompt)}
            className="stitch-node-glass p-4 text-left group hover:border-pink-neon/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <p.icon className="text-pink-neon" size={16} />
              <span className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon">
                {p.label}
              </span>
            </div>
            <p className="text-[0.8rem] text-on-surface-variant leading-relaxed group-hover:text-on-surface transition-colors">
              {p.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
