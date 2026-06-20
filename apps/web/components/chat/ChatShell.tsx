"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { IconLogOut, IconPlus, IconSettings } from "@/components/Icons";
import { api, GATEWAY_URL } from "@/lib/api";
import { getToken, clearTokenCookie } from "@/lib/client-auth";
import { logoutAction } from "@/lib/auth-actions";
import type { Thread, User } from "@/lib/types";

export function ChatShell({ user, children }: { user: User; children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  async function loadThreads() {
    try {
      const token = getToken();
      const res = await fetch(`${GATEWAY_URL}/api/threads`, {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setThreads(data.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingThreads(false);
    }
  }

  useEffect(() => {
    loadThreads();
  }, []);

  // Refresh thread list when navigating to a chat page (after sending messages)
  useEffect(() => {
    const handler = () => loadThreads();
    window.addEventListener("foxy:threads-changed", handler);
    return () => window.removeEventListener("foxy:threads-changed", handler);
  }, []);

  async function handleLogout() {
    clearTokenCookie();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="h-screen w-screen flex bg-background text-on-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] shrink-0 border-r border-white/5 bg-surface-1 flex flex-col">
        {/* Brand */}
        <div className="h-14 px-4 flex items-center border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size={24} />
            <span className="font-display-md text-[0.95rem] tracking-tighter">
              <span className="text-on-surface">Foxyse</span>
              <span className="text-pink-neon">Labs</span>
              <span className="text-on-surface">.</span>
            </span>
          </Link>
        </div>

        {/* New chat */}
        <div className="p-3">
          <Link
            href="/chat/new"
            className="btn-primary-filled w-full py-2 text-[0.65rem]"
          >
            <IconPlus size={14} />
            New chat
          </Link>
        </div>

        {/* Threads */}
        <nav className="flex-1 overflow-y-auto px-2 pb-3 scrollbar-thin">
          <p className="px-3 py-2 text-[0.55rem] font-label-mono uppercase tracking-widest text-text-subtle">
            Recent
          </p>
          {loadingThreads ? (
            <div className="px-3 py-2 text-[0.75rem] text-text-subtle">Loading...</div>
          ) : threads.length === 0 ? (
            <div className="px-3 py-2 text-[0.75rem] text-text-subtle">No threads yet</div>
          ) : (
            <ul className="space-y-0.5">
              {threads.map((t) => {
                const href = `/chat/${t.id}`;
                const isActive = pathname === href;
                return (
                  <li key={t.id}>
                    <Link
                      href={href}
                      className={`block px-3 py-2 text-[0.8rem] truncate transition-colors ${
                        isActive
                          ? "bg-pink-neon/10 text-on-surface border-l-2 border-pink-neon"
                          : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface border-l-2 border-transparent"
                      }`}
                      title={t.title || "Untitled"}
                    >
                      {t.title || "Untitled"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="px-3 pt-5 pb-2 text-[0.55rem] font-label-mono uppercase tracking-widest text-text-subtle">
            Extensions
          </p>
          <div className="px-3 py-2 text-[0.75rem] text-text-subtle">
            MCP &amp; .mcpb coming in Sprint 4
          </div>
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-DEFAULT bg-gradient-to-br from-pink-neon to-primary-container flex items-center justify-center font-label-mono text-[0.7rem] font-semibold text-on-primary">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.78rem] text-on-surface truncate font-medium">{user.name}</p>
            <p className="text-[0.65rem] text-text-subtle truncate font-label-mono">
              {user.default_provider}/{user.default_model}
            </p>
          </div>
          <Link href="/settings" className="btn-ghost p-1.5" aria-label="Settings">
            <IconSettings size={14} />
          </Link>
          <button onClick={handleLogout} className="btn-ghost p-1.5" aria-label="Log out">
            <IconLogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  );
}
