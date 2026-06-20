import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { ChatShell } from "@/components/chat/ChatShell";

export const metadata = { title: "Chat — FoxyseLabs" };

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return <ChatShell user={user}>{children}</ChatShell>;
}
