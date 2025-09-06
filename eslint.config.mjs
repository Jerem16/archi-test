// eslint.config.mjs (RACINE)
import { fileURLToPath } from "node:url";
import path from "node:path";
import makeNextConfig from "@packages/eslint-config/next-js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

const tsconfigRootDir = path.dirname(fileURLToPath(new URL("./package.json", import.meta.url)));

export default [
    // Ignorés globalement
    {
        ignores: [
            "**/dist/**",
            "**/.next/**",
            "**/node_modules/**",
            "**/eslint.config.js",
            "apps/web/next-env.d.ts",
            "apps/web/next.config.ts",
        ],
    },

    // Bloc Next + TS (type-checked) fourni par ton package interne
    ...makeNextConfig({
        webProject: "./apps/web/tsconfig.json",
    }),

    // ⚛️ Bloc React + Hooks (APP web uniquement)
    {
        files: ["apps/web/{app,src}/**/*.{ts,tsx}"],
        plugins: { react: pluginReact, "react-hooks": pluginReactHooks },
        settings: { react: { version: "detect" } },
        rules: {
            // Hooks
            ...pluginReactHooks.configs.recommended.rules,

            // Règles React minimales pour ton besoin
            "react/jsx-no-undef": "error",
            "react/react-in-jsx-scope": "off",
        },
    },

    // Lint des packages avec TS type-checked (évite de toucher à rules ici)
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
                tsconfigRootDir,
            },
        },
    },
];
