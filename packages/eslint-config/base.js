// packages/eslint-config/base.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";

export default [
    {
        ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**"],
    },

    // Base JS
    js.configs.recommended,

    // TypeScript (type-checked). Le consumer doit fournir parserOptions.project.
    ...tseslint.configs.recommendedTypeChecked,

    // Soft-mode (transforme error -> warn en dev si plugin activé)
    { plugins: { "only-warn": onlyWarn } },

    // Neutralise les conflits avec Prettier si tu l'utilises
    eslintConfigPrettier,

    // Globals Node/Browser utiles
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
    },
];
