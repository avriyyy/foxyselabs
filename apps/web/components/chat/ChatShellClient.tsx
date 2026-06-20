"use client";

import { useEffect, useState } from "react";
import { ChatShell } from "./ChatShell";
import type { User } from "@/lib/types";

/**
 * Client wrapper that holds the files panel open/closed state and
 * passes it down to ChatShell. Listens for the `foxy:toggle-files`
 * custom event so ChatView's Files button can toggle the panel.
 */
export function ChatShellClient({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [filesOpen, setFilesOpen] = useState(false);
  useEffect(() => {
    const handler = () => setFilesOpen((v) => !v);
    window.addEventListener("foxy:toggle-files", handler);
    return () => window.removeEventListener("foxy:toggle-files", handler);
  }, []);
  return (
    <ChatShell
      user={user}
      filesOpen={filesOpen}
      onFilesOpenChange={setFilesOpen}
    >
      {children}
    </ChatShell>
  );
}
