// src/amplify/setup.ts
import { Amplify } from "aws-amplify";
import outputs from "@apps/amplify_outputs.json";
declare global {
    var __AMPLIFY_CONFIGURED__: boolean | undefined;
}

export {};
const overrides = {
    auth: {
        ...outputs.auth,
        // oauth: { domain: "auth.peur-de-la-conduite.fr" },
    },
    data: {
        ...outputs.data,
        url: "https://api.peur-de-la-conduite.fr/graphql",
    },
} as const;

const cfg = { ...outputs, ...overrides };

// Idempotence globale (dev + HMR + client/serveur)
if (!globalThis.__AMPLIFY_CONFIGURED__) {
    Amplify.configure(cfg, { ssr: true }); // <-- ici on balance bien cfg
    globalThis.__AMPLIFY_CONFIGURED__ = true;
}
