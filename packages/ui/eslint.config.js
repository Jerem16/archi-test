import { fileURLToPath } from "node:url";
import path from "node:path";
import baseConfig from "@packages/eslint-config/base";

const tsconfigRootDir = path.dirname(fileURLToPath(new URL("./package.json", import.meta.url)));

export default [
    // ✅ typed-linting uniquement sur TS/TSX
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.json"],
                tsconfigRootDir,
            },
        },
    },
    // ✅ on évite de typer le fichier de config lui-même
    { ignores: ["eslint.config.js"] },

    ...baseConfig,
];
