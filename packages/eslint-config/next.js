// packages/eslint-config/next.js
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextPlugin from "@next/eslint-plugin-next";
import { config as reactConfig } from "./react-internal.js";

const tsconfigRootDir = path.dirname(fileURLToPath(new URL("../../package.json", import.meta.url)));
const nextRules = nextPlugin.configs["core-web-vitals"].rules;

export default function makeNextConfig({
    project = "./apps/desktop/tsconfig.json",
    include = ["apps/desktop/{app,src}/**/*.{ts,tsx}"],
    rootDirs = ["apps/desktop/"],
} = {}) {
    const projects = Array.isArray(project) ? project : [project];
    const files = Array.isArray(include) ? include : [include];
    const roots = Array.isArray(rootDirs) ? rootDirs : [rootDirs];

    return [
        ...reactConfig,

        // Bloc Next + TS (type-checked). Le consumer passera le tsconfig de l'app.
        {
            files,
            plugins: { "@next/next": nextPlugin },
            languageOptions: {
                parserOptions: {
                    project: projects,
                    tsconfigRootDir, // racine monorepo
                },
            },
            settings: { next: { rootDir: roots } },
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
