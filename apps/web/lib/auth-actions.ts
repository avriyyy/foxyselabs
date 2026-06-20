import { GATEWAY_URL } from "./api";
import type { AuthResponse } from "./types";

/**
 * Server action: register, set httpOnly cookie, redirect to /chat.
 * Called from /register page.
 */
export async function registerAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }

  let data: AuthResponse;
  try {
    const res = await fetch(`${GATEWAY_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      const err = text ? JSON.parse(text) : { error: res.statusText };
      return { error: err.error || "Registration failed" };
    }
    data = JSON.parse(text) as AuthResponse;
  } catch (e) {
    return { error: "Could not reach server" };
  }

  const { cookies } = await import("next/headers");
  const store = await cookies();
  // Non-httpOnly so client-side JS can read it for cross-origin fetch to gateway.
  // The token is short-lived (24h) and the gateway is on a separate origin.
  store.set("foxy_token", data.access_token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  const { redirect } = await import("next/navigation");
  redirect("/chat");
}

export async function loginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let data: AuthResponse;
  try {
    const res = await fetch(`${GATEWAY_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      const err = text ? JSON.parse(text) : { error: res.statusText };
      return { error: err.error || "Login failed" };
    }
    data = JSON.parse(text) as AuthResponse;
  } catch {
    return { error: "Could not reach server" };
  }

  const { cookies } = await import("next/headers");
  const store = await cookies();
  store.set("foxy_token", data.access_token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  const { redirect } = await import("next/navigation");
  redirect("/chat");
}

export async function logoutAction() {
  "use server";
  const { cookies } = await import("next/headers");
  const store = await cookies();
  store.delete("foxy_token");
  const { redirect } = await import("next/navigation");
  redirect("/");
}
