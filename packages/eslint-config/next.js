// packages/eslint-config/next.js
import nextPlugin from "@next/eslint-plugin-next";
import base from "./base.js";

const nextRules = nextPlugin.configs["core-web-vitals"].rules;

export default function makeNextConfig({
    webProject = "./apps/web/tsconfig.json",
    include = ["apps/web/{app,src}/**/*.{ts,tsx}"],
} = {}) {
    return [
        ...base,

        // Bloc Next + TS (type-checked). Le consumer passera le tsconfig de l'app.
        {
            files: include,
            plugins: { "@next/next": nextPlugin },
            languageOptions: {
                parserOptions: {
                    project: [webProject],
                    tsconfigRootDir: new URL("../../", import.meta.url).pathname, // racine monorepo
                },
            },
            settings: { next: { rootDir: ["apps/web/"] } },
            rules: {
                ...nextRules,
                "@next/next/no-html-link-for-pages": "off", // App Router
            },
        },
    ];
}
