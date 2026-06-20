import { redirect } from "next/navigation";
import { INTERNAL_GATEWAY_URL } from "@/lib/api";

export default async function RootPage() {
  // Check if system is initialized. If not, show onboarding.
  try {
    const res = await fetch(`${INTERNAL_GATEWAY_URL}/api/admin/me`, {
      cache: "no-store",
    });
    if (res.status === 404) {
      redirect("/setup");
    }
    if (!res.ok) {
      redirect("/chat");
    }
    redirect("/chat");
  } catch {
    redirect("/chat");
  }
}
