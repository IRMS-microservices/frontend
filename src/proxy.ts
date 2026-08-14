import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];
const URL_MAP = new Map<string, string>([
    ["ADMIN", "/admin/account"],
    ["SERVER", "/server/tables"],
    ["KITCHEN_STAFF", "/kitchen/chef"]
]);

const EXACT_PUBLIC_ROUTES = ["/"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isPublicRoute =
        EXACT_PUBLIC_ROUTES.includes(pathname) ||
        PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    const token = request.cookies.get("accessToken")?.value;
    const role = request.cookies.get("role")?.value;

    if (!isPublicRoute && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isPublicRoute && token) {
        const homeUrl = URL_MAP.get(role ?? "");
        if (!homeUrl) {
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("accessToken");
            response.cookies.delete("role");
            return response;
        }
        return NextResponse.redirect(new URL(homeUrl, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/|backend/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
    ],
};