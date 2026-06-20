import { redirect } from "next/navigation";
import { INTERNAL_GATEWAY_URL } from "@/lib/api";
import { ChatShell } from "@/components/chat/ChatShell";
import type { User } from "@/lib/types";

export const metadata = { title: "Chat — FoxyseLabs" };

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  let user: User | null = null;
  try {
    const res = await fetch(`${INTERNAL_GATEWAY_URL}/api/admin/me`, { cache: "no-store" });
    if (res.status === 404) redirect("/setup");
    if (res.ok) user = (await res.json()) as User;
  } catch {
    // network
  }
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-on-surface">
        <div className="text-center">
          <p className="text-on-surface-variant">Could not reach gateway.</p>
          <a href="/setup" className="text-pink-neon hover:underline">Go to setup</a>
        </div>
      </div>
    );
  }
  // The Files panel state lives here (server-rendered) but the toggle
  // is handled by ChatView (client). We pass an initial closed state.
  return (
    <ChatShellWrapper user={user}>
      {children}
    </ChatShellWrapper>
  );
}

// Client wrapper because ChatShell needs useState for the files panel toggle.
import { ChatShellClient } from "@/components/chat/ChatShellClient";
function ChatShellWrapper({ user, children }: { user: User; children: React.ReactNode }) {
  return <ChatShellClient user={user}>{children}</ChatShellClient>;
}
