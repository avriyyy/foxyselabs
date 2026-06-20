/**
 * Two gateway URLs:
 *
 * - INTERNAL_GATEWAY_URL: how the Next.js SERVER reaches the gateway
 *   (must be reachable on the docker network, e.g. http://gateway:8080).
 *
 * - NEXT_PUBLIC_GATEWAY_URL: how the BROWSER reaches the gateway
 *   (must be reachable from the user's machine, e.g. http://localhost:8080
 *   or http://<vps_ip>:8080).
 *
 * Server-only code (server components) uses INTERNAL_GATEWAY_URL.
 * Client components use NEXT_PUBLIC_GATEWAY_URL.
 *
 * For self-hosted single-owner mode there is no JWT — all endpoints
 * are open and treat the first user in the DB as the owner.
 */

export const INTERNAL_GATEWAY_URL =
  process.env.INTERNAL_GATEWAY_URL || "http://gateway:8080";

export const PUBLIC_GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

export type ApiError = { error: string; detail?: string; message?: string };

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${INTERNAL_GATEWAY_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = (data as ApiError) || { error: res.statusText };
    throw new Error(err.error || err.message || "Request failed");
  }
  return data as T;
}
