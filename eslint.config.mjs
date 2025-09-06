// eslint.config.mjs
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
    { ignores: ["**/dist/**", "**/.next/**"] },
    js.configs.recommended,
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                // analyse type-aware sur TS solution + app
                project: ["packages/tsconfig.json", "apps/web/tsconfig.json"],
                tsconfigRootDir: process.cwd(),
            },
            globals: { ...globals.browser, ...globals.node },
        },
        plugins: { "@typescript-eslint": tsPlugin },
        rules: {
            ...tsPlugin.configs.recommendedTypeChecked[1].rules,
            "no-undef": "off",
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
];
