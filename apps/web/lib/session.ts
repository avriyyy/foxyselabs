import { cookies } from "next/headers";
import { GATEWAY_URL } from "@/lib/api";
import type { User } from "@/lib/types";

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get("foxy_token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${GATEWAY_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch {
    return null;
  }
}
