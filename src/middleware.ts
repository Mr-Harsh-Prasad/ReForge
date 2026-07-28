import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  
  // NextAuth v4 / early v5
  const legacyCookie = isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token";
  // NextAuth v5 beta
  const authjsCookie = isProd ? "__Secure-authjs.session-token" : "authjs.session-token";

  const token = req.cookies.get(authjsCookie) || req.cookies.get(legacyCookie);
  const isLoggedIn = !!token;

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
