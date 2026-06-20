"use client";

import { useEffect, useState } from "react";
import { IconActivity, IconClose, IconBrain, IconLoader, IconBolt } from "../Icons";
import type { LiveSession } from "@/lib/types";

export function ActivityPanel({
  session,
  onClose,
}: {
  session: LiveSession;
  onClose: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!session.startedAt || !session.running) return;
    const tick = () => {
      if (session.startedAt) {
        setElapsed(Math.floor((Date.now() - session.startedAt) / 1000));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session.startedAt, session.running]);

  const totalTokens = session.promptTokens + session.completionTokens;
  const estCost = (totalTokens / 1000) * 0.008; // rough MiMo estimate

  return (
    <aside className="w-[300px] shrink-0 border-l border-white/5 bg-surface-1 flex flex-col overflow-hidden">
      <div className="h-14 px-4 flex items-center border-b border-white/5">
        <IconActivity size={14} className="text-pink-neon mr-2" />
        <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon">
          Activity
        </p>
        <button
          onClick={onClose}
          className="ml-auto btn-ghost p-1.5"
          aria-label="Close activity panel"
        >
          <IconClose size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
        {/* Status */}
        <Section label="Status">
          {session.running ? (
            <div className="flex items-center gap-2 text-[0.8rem] text-pink-neon">
              <IconLoader size={12} className="animate-spin" />
              <span>running</span>
              <span className="text-text-muted font-mono ml-auto">
                {elapsed}s
              </span>
            </div>
          ) : session.lastError ? (
            <div className="flex items-center gap-2 text-[0.8rem] text-error">
              <span>errored</span>
            </div>
          ) : (
            <div className="text-[0.8rem] text-text-subtle">idle</div>
          )}
        </Section>

        {/* Model */}
        {session.model && (
          <Section label="Model">
            <p className="text-[0.8rem] text-on-surface font-mono break-words">
              {session.model}
            </p>
          </Section>
        )}

        {/* Token usage */}
        <Section label="Tokens">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="prompt" value={session.promptTokens.toLocaleString()} />
            <Metric label="completion" value={session.completionTokens.toLocaleString()} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[0.7rem] font-mono text-text-subtle">
            <span>total {totalTokens.toLocaleString()}</span>
            <span>~${estCost.toFixed(4)}</span>
          </div>
        </Section>

        {/* Tools available */}
        {session.tools.length > 0 && (
          <Section label={`Tools (${session.tools.length})`}>
            <div className="flex flex-wrap gap-1">
              {session.tools.map((t) => (
                <span
                  key={t}
                  className="text-[0.65rem] font-mono text-on-surface-variant bg-white/5 border border-white/5 px-1.5 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* MCP servers */}
        {session.mcpServers.length > 0 && (
          <Section label={`MCP servers (${session.mcpServers.length})`}>
            <div className="space-y-1">
              {session.mcpServers.map((s) => (
                <div
                  key={s}
                  className="text-[0.7rem] font-mono text-on-surface-variant flex items-center gap-1.5"
                >
                  <IconBolt size={10} className="text-pink-neon shrink-0" />
                  <span className="truncate">{s}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Last error */}
        {session.lastError && (
          <Section label="Last error">
            <div className="text-[0.75rem]">
              <p className="text-error font-mono">{session.lastError.code}</p>
              <p className="text-on-surface-variant mt-1 break-words">
                {session.lastError.message}
              </p>
            </div>
          </Section>
        )}

        {/* Thread id */}
        {session.threadId && (
          <Section label="Thread">
            <code className="text-[0.65rem] font-mono text-text-muted break-all">
              {session.threadId}
            </code>
          </Section>
        )}

        {/* Capabilities placeholder for Sprint 4 */}
        <Section label="Capabilities">
          <ul className="text-[0.7rem] text-text-subtle space-y-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-success" />
              Read / Write / Edit files
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-success" />
              Run shell commands
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-success" />
              Web fetch &amp; search
            </li>
            <li className="flex items-center gap-1.5 text-text-muted">
              <span className="w-1 h-1 rounded-full bg-white/20" />
              MCP servers (Sprint 4)
            </li>
          </ul>
        </Section>
      </div>
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-label-mono text-[0.55rem] uppercase tracking-widest text-text-subtle mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/5 bg-surface-container-low px-2.5 py-1.5">
      <p className="font-label-mono text-[0.55rem] uppercase tracking-widest text-text-subtle">
        {label}
      </p>
      <p className="text-[0.85rem] text-on-surface font-mono">{value}</p>
    </div>
  );
}
