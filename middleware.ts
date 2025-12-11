// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname.match(/\.(.*)$/)
    ) {
        return NextResponse.next();
    }

    if (pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = "/chat";
        return NextResponse.redirect(url);
    }

    const isAuthPage = AUTH_PAGES.includes(pathname);

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token && !isAuthPage) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (token && isAuthPage) {
        // Already logged in and trying to hit login/signup
        return NextResponse.redirect(new URL("/chat", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/chat/:path*",
        "/login",
        "/signup",
    ],
};
