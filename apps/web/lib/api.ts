export const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

export type ApiError = { error: string; detail?: string };

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${GATEWAY_URL}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = (data as ApiError) || { error: res.statusText };
    throw new Error(err.error || "Request failed");
  }
  return data as T;
}

export function getTokenFromCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const match = cookieValue.match(/foxy_token=([^;]+)/);
  return match ? match[1] : null;
}
