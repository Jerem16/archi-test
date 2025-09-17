import type { Hosts, ThresholdConfig } from "@packages/types";

const DEFAULT_MOBILE = "mobile.localhost:3001";
const DEFAULT_DESKTOP = "localhost:3000";
const DEFAULT_THRESHOLD = 900;

export function getHostsServer(): Hosts {
    const mobile = process.env.HOST_MOBILE ?? process.env.NEXT_PUBLIC_HOST_MOBILE ?? DEFAULT_MOBILE;
    const desktop = process.env.HOST_DESKTOP ?? process.env.NEXT_PUBLIC_HOST_DESKTOP ?? DEFAULT_DESKTOP;
    return { mobileHost: mobile, desktopHost: desktop };
}

export function getHostsClient(): Hosts {
    const mobile = process.env.NEXT_PUBLIC_HOST_MOBILE ?? DEFAULT_MOBILE;
    const desktop = process.env.NEXT_PUBLIC_HOST_DESKTOP ?? DEFAULT_DESKTOP;
    return { mobileHost: mobile, desktopHost: desktop };
}

export function getThreshold(): ThresholdConfig {
    const raw = process.env.NEXT_PUBLIC_PLATFORM_THRESHOLD ?? String(DEFAULT_THRESHOLD);
    const parsed = Number(raw);
    const px = Number.isNaN(parsed) ? DEFAULT_THRESHOLD : parsed;
    return { px };
}
