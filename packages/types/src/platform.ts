export type Platform = "mobile" | "desktop";

export interface Hosts {
    mobileHost: string; // ex: "mobile.peur-de-la-conduite.fr" ou "localhost:3001"
    desktopHost: string; // ex: "desktop.peur-de-la-conduite.fr" ou "localhost:3000"
}

export interface ThresholdConfig {
    px: number; // ex: 900
}
