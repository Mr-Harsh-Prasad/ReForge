import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  const sessionCookie = allCookies.find(
    (c) => c.name.includes("session-token") && c.value && c.value.trim() !== ""
  );
  const isLoggedIn = !!sessionCookie;

  const pathname = req.nextUrl.pathname;

  const protectedRoutes = ["/dashboard", "/missions", "/goals", "/analytics", "/achievements", "/settings"];
  const authRoutes = ["/auth/login", "/auth/register"];

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
