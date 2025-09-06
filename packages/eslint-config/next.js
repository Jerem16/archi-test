// packages/eslint-config/next.js
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextPlugin from "@next/eslint-plugin-next";
import { config as reactConfig } from "./react-internal.js";

const tsconfigRootDir = path.dirname(fileURLToPath(new URL("../../package.json", import.meta.url)));
const nextRules = nextPlugin.configs["core-web-vitals"].rules;

export default function makeNextConfig({
    webProject = "./apps/web/tsconfig.json",
    include = ["apps/web/{app,src}/**/*.{ts,tsx}"],
} = {}) {
    return [
        ...reactConfig,

        // Bloc Next + TS (type-checked). Le consumer passera le tsconfig de l'app.
        {
            files: include,
            plugins: { "@next/next": nextPlugin },
            languageOptions: {
                parserOptions: {
                    project: [webProject],
                    tsconfigRootDir, // racine monorepo
                },
            },
            settings: { next: { rootDir: ["apps/web/"] } },
            rules: {
                ...nextRules,
                "@next/next/no-html-link-for-pages": "off",
                // TypeScript "unsafe" → trop verbeux dans l'app Next
                "@typescript-eslint/no-unsafe-call": "off",
                "@typescript-eslint/no-unsafe-member-access": "off",
                "@typescript-eslint/no-unsafe-return": "off",
                "@typescript-eslint/no-unsafe-assignment": "off",
            },
        },
    ];
}
