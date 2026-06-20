"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { IconPlus } from "@/components/Icons";
import { FileExplorerPanel } from "./FileExplorerPanel";
import { PUBLIC_GATEWAY_URL } from "@/lib/api";
import type { Thread, User } from "@/lib/types";

export function ChatShell({
  user,
  initialWorkspacePath,
  initialThreadId,
  filesOpen,
  onFilesOpenChange,
  children,
}: {
  user: User;
  initialWorkspacePath?: string;
  initialThreadId?: string;
  filesOpen: boolean;
  onFilesOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [currentWorkspace, setCurrentWorkspace] = useState<string | undefined>(
    initialWorkspacePath
  );
  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(
    initialThreadId
  );
  const pathname = usePathname();

  async function loadThreads() {
    try {
      const res = await fetch(`${PUBLIC_GATEWAY_URL}/api/threads`, { cache: "no-store" });
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

  useEffect(() => {
    const handler = () => loadThreads();
    window.addEventListener("foxy:threads-changed", handler);
    return () => window.removeEventListener("foxy:threads-changed", handler);
  }, []);

  // Update current workspace + thread when route changes
  useEffect(() => {
    // Extract threadId from path
    const match = pathname.match(/^\/chat\/([^/]+)$/);
    if (match && match[1] !== "new") {
      setCurrentThreadId(match[1]);
      // load workspace from thread detail
      fetch(`${PUBLIC_GATEWAY_URL}/api/threads/${match[1]}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.thread?.workspace_path) {
            setCurrentWorkspace(data.thread.workspace_path);
          }
        })
        .catch(() => {});
    } else {
      setCurrentThreadId(undefined);
      setCurrentWorkspace(initialWorkspacePath);
    }
  }, [pathname, initialWorkspacePath]);

  return (
    <div className="h-screen w-screen flex bg-background text-on-surface overflow-hidden">
      <aside className="w-[280px] shrink-0 border-r border-white/5 bg-surface-1 flex flex-col">
        <div className="h-14 px-4 flex items-center border-b border-white/5">
          <Link href="/chat" className="flex items-center gap-2 group">
            <Logo size={24} />
            <span className="font-display-md text-[0.95rem] tracking-tighter">
              <span className="text-on-surface">Foxyse</span>
              <span className="text-pink-neon">Labs</span>
              <span className="text-on-surface">.</span>
            </span>
          </Link>
        </div>

        <div className="p-3">
          <Link href="/chat/new" className="btn-primary-filled w-full py-2 text-[0.65rem]">
            <IconPlus size={14} /> New chat
          </Link>
        </div>

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

          {user.is_admin && (
            <>
              <p className="px-3 pt-5 pb-2 text-[0.55rem] font-label-mono uppercase tracking-widest text-text-subtle">
                Admin
              </p>
              <Link
                href="/admin"
                className="w-full block text-left px-3 py-2 text-[0.8rem] text-on-surface-variant hover:bg-white/5 hover:text-on-surface border-l-2 border-transparent transition-colors"
              >
                Users & workspaces
              </Link>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-DEFAULT bg-gradient-to-br from-pink-neon to-primary-container flex items-center justify-center font-label-mono text-[0.7rem] font-semibold text-on-primary">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.78rem] text-on-surface truncate font-medium">{user.name}</p>
            <p className="text-[0.65rem] text-text-subtle truncate font-label-mono">
              {user.is_admin ? "admin" : "user"}
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        {children}
        {filesOpen && currentThreadId && (
          <div className="absolute top-14 right-0 bottom-0 z-20 shadow-2xl">
            <FileExplorerPanel
              threadId={currentThreadId}
              workspacePath={currentWorkspace || ""}
              onClose={() => onFilesOpenChange(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
