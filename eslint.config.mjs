import makeNextConfig from "@packages/eslint-config/next-js";

export default [
    {
        ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "**/eslint.config.js"],
    },
    { ignores: ["apps/web/next-env.d.ts", "apps/web/next.config.ts"] },
    ...makeNextConfig({
        webProject: "./apps/web/tsconfig.json",
    }),
    {
        files: ["packages/**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                project: [
                    "./packages/domain/tsconfig.json",
                    "./packages/services/tsconfig.json",
                    "./packages/types/tsconfig.json",
                    "./packages/ui/tsconfig.json",
                ],
                tsconfigRootDir: new URL("./", import.meta.url).pathname,
            },
        },
    },
];
