import { fileURLToPath } from "node:url";
import path from "node:path";
import baseConfig from "@packages/eslint-config/base";

const tsconfigRootDir = path.dirname(fileURLToPath(new URL("./package.json", import.meta.url)));

export default [
    {
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.json"],
                tsconfigRootDir,
            },
        },
    },
    ...baseConfig,
];
