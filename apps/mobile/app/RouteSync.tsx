"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getHostsClient, getThreshold } from "@packages/services/platform/env";
import type { Hosts } from "@packages/types";

function buildUrl(hosts: Hosts, targetMobile: boolean, path: string, query: string, hash: string): string {
    const protocol = window.location.protocol;
    const host = targetMobile ? hosts.mobileHost : hosts.desktopHost;
    const q = query ? `?${query}` : "";
    const h = hash || "";
    return `${protocol}//${host}${path}${q}${h}`;
}

export default function RouteSync(): null {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (typeof window === "undefined") return;

        const { mobileHost, desktopHost } = getHostsClient();
        const { px } = getThreshold();

        const isTargetMobile = window.innerWidth < px;
        const currentHost = window.location.host;
        const shouldBeHost = isTargetMobile ? mobileHost : desktopHost;

        if (currentHost !== shouldBeHost) {
            const target = buildUrl(
                { mobileHost, desktopHost },
                isTargetMobile,
                pathname,
                searchParams.toString(),
                window.location.hash,
            );
            window.location.replace(target);
        }
    }, [pathname, searchParams]);

    return null;
}
