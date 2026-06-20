/**
 * Read the access token from the non-httpOnly cookie.
 * Safe to call from both client and server components.
 */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)foxy_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function clearTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "foxy_token=; Max-Age=0; path=/";
}
