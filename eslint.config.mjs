import { fileURLToPath } from "node:url";
import path from "node:path";
import makeNextConfig from "@packages/eslint-config/next-js";

const tsconfigRootDir = path.dirname(fileURLToPath(new URL("./package.json", import.meta.url)));

export default [
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
                tsconfigRootDir,
            },
        },
    },
];
