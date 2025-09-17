import { NextResponse, type NextRequest } from "next/server";
import { getHostsServer } from "@packages/services/platform/env";

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const { mobileHost, desktopHost } = getHostsServer();
    const host = url.host;
    const ua = req.headers.get("user-agent") ?? "";
    const isMobileUA = MOBILE_UA.test(ua);

    const onMobileHost = host === mobileHost;
    const onDesktopHost = host === desktopHost;

    if (isMobileUA && !onMobileHost) {
        const nextUrl = url.clone();
        nextUrl.host = mobileHost;
        return NextResponse.redirect(nextUrl, 307);
    }
    if (!isMobileUA && !onDesktopHost) {
        const nextUrl = url.clone();
        nextUrl.host = desktopHost;
        return NextResponse.redirect(nextUrl, 307);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)"],
};
