import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register"];
  if (publicRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const isAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    /\.[\w]+$/.test(pathname);
  if (isAsset) return NextResponse.next();

  const token = req.cookies.get("session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};