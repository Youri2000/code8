/**
 * 登录后的回跳地址只接受站内相对路径，防止 `?next=https://evil.com` 这类开放重定向。
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/w"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
