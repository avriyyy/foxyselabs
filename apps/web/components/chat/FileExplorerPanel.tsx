"use client";

import { useEffect, useState } from "react";
import { IconClose, IconFile, IconFolder, IconLoader, IconRead } from "../Icons";

type FileEntry = {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
};

const INTERNAL_GATEWAY_FALLBACK =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "http://gateway:8080";

function authHeaders(): Record<string, string> {
  // use cookie automatically
  return { "Content-Type": "application/json" };
}

export function FileExplorerPanel({
  threadId,
  workspacePath,
  onClose,
}: {
  threadId: string | null;
  workspacePath: string;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  async function load(path: string) {
    if (!threadId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${INTERNAL_GATEWAY_FALLBACK}/api/sandboxes/${threadId}/files?path=${encodeURIComponent(path)}`,
        { headers: authHeaders(), cache: "no-store" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || `failed (${res.status})`);
        setFiles([]);
        return;
      }
      const data = await res.json();
      setFiles(data.data || []);
      setCurrentPath(path);
    } catch (e) {
      setError((e as Error).message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  // Reload when thread changes, and refresh every 10s while open
  useEffect(() => {
    if (!threadId) {
      setFiles([]);
      return;
    }
    load("");
    const id = setInterval(() => load(currentPath), 10_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  async function open(file: FileEntry) {
    if (file.is_dir) {
      // navigate into directory
      const next = currentPath ? `${currentPath}/${file.name}` : file.name;
      load(next);
      return;
    }
    if (!threadId) return;
    setOpenFile(file.path);
    setFileContent(null);
    setFileError(null);
    setFileLoading(true);
    try {
      const res = await fetch(
        `${INTERNAL_GATEWAY_FALLBACK}/api/sandboxes/${threadId}/files/content?path=${encodeURIComponent(file.path)}`,
        { headers: authHeaders(), cache: "no-store" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFileError(data.detail || `failed (${res.status})`);
        return;
      }
      const data = await res.json();
      setFileContent(data.content || "");
    } catch (e) {
      setFileError((e as Error).message);
    } finally {
      setFileLoading(false);
    }
  }

  function goUp() {
    if (!currentPath) return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    load(parts.join("/"));
  }

  return (
    <aside className="w-[320px] shrink-0 border-l border-white/5 bg-surface-1 flex flex-col overflow-hidden">
      <div className="h-14 px-4 flex items-center border-b border-white/5">
        <IconFolder size={14} className="text-pink-neon mr-2" />
        <p className="font-label-mono text-[0.6rem] uppercase tracking-widest text-pink-neon flex-1 min-w-0 truncate">
          Files
        </p>
        <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close">
          <IconClose size={14} />
        </button>
      </div>

      <div className="px-4 py-2 border-b border-white/5 text-[0.65rem] font-mono text-text-muted truncate">
        {workspacePath || "(no workspace)"}
      </div>

      {/* breadcrumbs */}
      <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-1 text-[0.65rem] font-mono">
        {currentPath && (
          <button
            onClick={goUp}
            className="text-pink-neon hover:underline"
          >
            ..
          </button>
        )}
        <span className="text-text-subtle truncate">
          /{currentPath || ""}
        </span>
        <button
          onClick={() => load(currentPath)}
          className="ml-auto text-text-subtle hover:text-on-surface"
          title="Refresh"
        >
          {loading ? <IconLoader size={10} className="animate-spin" /> : "↻"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {error ? (
          <p className="px-4 py-3 text-[0.75rem] text-error font-mono break-words">
            {error}
          </p>
        ) : files.length === 0 && !loading ? (
          <p className="px-4 py-3 text-[0.75rem] text-text-subtle">
            {threadId ? "No files yet" : "Sandbox not running"}
          </p>
        ) : (
          <ul className="py-1">
            {files.map((f) => (
              <li key={f.path}>
                <button
                  onClick={() => open(f)}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/5 flex items-center gap-2 text-[0.78rem] text-on-surface-variant"
                >
                  {f.is_dir ? (
                    <IconFolder size={12} className="text-pink-neon shrink-0" />
                  ) : (
                    <IconFile size={12} className="text-text-subtle shrink-0" />
                  )}
                  <span className="truncate font-mono">{f.name}</span>
                  {!f.is_dir && f.size > 0 && (
                    <span className="ml-auto text-[0.6rem] text-text-muted font-mono shrink-0">
                      {formatSize(f.size)}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* file preview modal */}
      {openFile !== null && (
        <div className="absolute inset-0 bg-background/95 flex flex-col z-10">
          <div className="h-12 px-4 flex items-center border-b border-white/5">
            <IconRead size={14} className="text-pink-neon mr-2" />
            <p className="font-label-mono text-[0.65rem] uppercase tracking-widest text-pink-neon flex-1 min-w-0 truncate">
              {openFile}
            </p>
            <button
              onClick={() => {
                setOpenFile(null);
                setFileContent(null);
                setFileError(null);
              }}
              className="btn-ghost p-1.5"
            >
              <IconClose size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 scrollbar-thin">
            {fileLoading ? (
              <div className="flex items-center gap-2 text-text-subtle text-[0.8rem]">
                <IconLoader size={12} className="animate-spin" /> loading...
              </div>
            ) : fileError ? (
              <p className="text-error text-[0.8rem] font-mono">{fileError}</p>
            ) : fileContent !== null ? (
              <pre className="text-[0.78rem] text-on-surface font-mono leading-relaxed whitespace-pre-wrap break-words">
                {fileContent}
              </pre>
            ) : null}
          </div>
        </div>
      )}
    </aside>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}M`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}G`;
}
