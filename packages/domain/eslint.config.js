// packages/<pkg>/eslint.config.js
import { fileURLToPath } from "node:url";
import path from "node:path";
import baseConfig from "@packages/eslint-config/base";

const tsconfigRootDir = path.dirname(fileURLToPath(new URL("./package.json", import.meta.url)));

export default [
    // ⛔️ ne pas linter ce fichier + dossiers usuels
    {
        ignores: ["**/dist/**", "**/node_modules/**", "eslint.config.js"],
    },

    // ✅ bloc "typed" UNIQUEMENT pour TS/TSX de ce package
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.json"],
                tsconfigRootDir,
            },
        },
    },

    // 📦 règles de base partagées (JS + TS)
    ...baseConfig,
];
