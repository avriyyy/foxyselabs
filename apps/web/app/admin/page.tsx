import { redirect } from "next/navigation";
import { INTERNAL_GATEWAY_URL } from "@/lib/api";
import { AdminClient } from "@/components/AdminClient";
import type { User } from "@/lib/types";

export const metadata = { title: "Admin — FoxyseLabs" };

export default async function AdminPage() {
  let user: User | null = null;
  try {
    const res = await fetch(`${INTERNAL_GATEWAY_URL}/api/admin/me`, { cache: "no-store" });
    if (res.status === 404) redirect("/setup");
    if (res.ok) user = (await res.json()) as User;
  } catch {
    // network
  }
  if (!user) redirect("/setup");
  return <AdminClient me={user} />;
}
