import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, cookieName } from "@/lib/cookies";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isAsset =
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname === "/favicon.ico" ||
        /\.[\w]+$/.test(pathname);
    if (isAsset) return NextResponse.next();

    if (pathname === "/login" || pathname === "/register") {
        const token = req.cookies.get(cookieName)?.value;
        if (token) {
            try {
                await verifySession(token);
                return NextResponse.redirect(new URL("/", req.url));
            } catch {
    
            }
        }
        return NextResponse.next();
    }

    const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register"];
    if (publicRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        return NextResponse.next();
    }

    const token = req.cookies.get(cookieName)?.value;
    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    try {
        await verifySession(token);
        return NextResponse.next();
    } catch {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        const res = NextResponse.redirect(url);

        res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
        return res;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};