import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 乐观检查：没有会话 cookie 就直接跳到登录页，并带上回跳地址。
 * 这里不做授权（cookie 可能已失效或被伪造），真正的校验在页面和 Server Action 中进行（ADR-0008）。
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/w", "/w/:path*"],
};
