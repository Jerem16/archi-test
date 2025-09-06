// eslint.config.mjs (RACINE)
import { fileURLToPath } from "node:url";
import path from "node:path";
import makeNextConfig from "@packages/eslint-config/next-js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

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

    // ✅ Preset Next + React + TS (core-web-vitals SANS modification)
    // (Ton package interne applique déjà @next/eslint-plugin-next core-web-vitals
    // et désactive seulement no-html-link-for-pages pour l’App Router)
    ...makeNextConfig({
        webProject: "./apps/web/tsconfig.json",
        include: ["apps/web/{app,src}/**/*.{ts,tsx}"],
    }),

    // 🔧 CIBLE apps/web : parser TS type-aware + resolver TS + quelques règles hors Next
    {
        files: ["apps/web/{app,src}/**/*.{ts,tsx}"],
        plugins: {
            import: importPlugin,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: ["./apps/web/tsconfig.json"],
                tsconfigRootDir,
            },
        },
        settings: {
            // pour import/no-unresolved avec les alias TS
            "import/resolver": {
                typescript: {
                    project: [
                        "./apps/web/tsconfig.json",
                        "./packages/types/tsconfig.json",
                        "./packages/domain/tsconfig.json",
                        "./packages/services/tsconfig.json",
                        "./packages/ui/tsconfig.json",
                    ],
                },
            },
            next: { rootDir: ["apps/web/"] },
        },
        rules: {
            // 🧩 Règles NON-Next utiles côté app
            "react/jsx-no-undef": "error", // ton cas de test sur <AuthProvider>
            "react/react-in-jsx-scope": "off",

            // miroirs d’erreurs tsc pour tes alias/paths
            "import/no-unresolved": "error",

            // ↓ Bruit TS côté UI (ne change pas les règles Next)
            "@typescript-eslint/no-unsafe-call": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-unsafe-return": "warn",
            "@typescript-eslint/no-redundant-type-constituents": "warn",
        },
    },

    // 🔧 packages : type-aware strict
    {
        files: ["packages/**/*.{ts,tsx}"],
        plugins: { import: importPlugin }, // ❌ pas de "@typescript-eslint" ici non plus
        languageOptions: {
            parser: tseslint.parser,
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
        settings: {
            "import/resolver": {
                typescript: {
                    project: [
                        "./packages/domain/tsconfig.json",
                        "./packages/services/tsconfig.json",
                        "./packages/types/tsconfig.json",
                        "./packages/ui/tsconfig.json",
                    ],
                },
            },
        },
        rules: {
            "import/no-unresolved": "error",
        },
    },
];
