// eslint.config.mjs (RACINE)
import { fileURLToPath } from "node:url";
import path from "node:path";
import makeNextConfig from "./packages/eslint-config/next.js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

const tsconfigRootDir = path.dirname(fileURLToPath(new URL("./package.json", import.meta.url)));

const appWorkspaces = [
    { name: "desktop", tsconfig: "./apps/desktop/tsconfig.json" },
    { name: "mobile", tsconfig: "./apps/mobile/tsconfig.json" },
];

const sharedPackageProjects = [
    "./packages/types/tsconfig.json",
    "./packages/domain/tsconfig.json",
    "./packages/services/tsconfig.json",
    "./packages/ui/tsconfig.json",
];

const appConfigs = appWorkspaces.flatMap(({ name, tsconfig }) => {
    const include = [`apps/${name}/{app,src}/**/*.{ts,tsx}`, `apps/${name}/middleware.ts`];
    const rootDir = [`apps/${name}/`];

    return [
        ...makeNextConfig({ project: tsconfig, include, rootDirs: rootDir }),
        {
            files: include,
            plugins: {
                import: importPlugin,
            },
            languageOptions: {
                parser: tseslint.parser,
                parserOptions: {
                    project: [tsconfig],
                    tsconfigRootDir,
                },
            },
            settings: {
                "import/resolver": {
                    typescript: {
                        project: [tsconfig, ...sharedPackageProjects],
                    },
                },
                next: { rootDir },
            },
            rules: {
                "react/jsx-no-undef": "error", // ton cas de test sur <AuthProvider>
                "react/react-in-jsx-scope": "off",
                "import/no-unresolved": "error",
                "@typescript-eslint/no-unsafe-call": "warn",
                "@typescript-eslint/no-unsafe-member-access": "warn",
                "@typescript-eslint/no-unsafe-assignment": "warn",
                "@typescript-eslint/no-unsafe-return": "warn",
                "@typescript-eslint/no-redundant-type-constituents": "warn",
            },
        },
    ];
});

export default [
    {
        ignores: [
            "**/dist/**",
            "**/.next/**",
            "**/node_modules/**",
            "**/eslint.config.js",
            "apps/desktop/next-env.d.ts",
            "apps/desktop/next.config.ts",
            "apps/mobile/next-env.d.ts",
            "apps/mobile/next.config.ts",
            "**/*.d.ts",
        ],
    },

    ...appConfigs,

    // 🔧 packages : type-aware strict
    {
        files: ["packages/**/*.{ts,tsx}"],
        ignores: ["packages/**/*.d.ts"],
        plugins: { import: importPlugin },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: sharedPackageProjects,
                tsconfigRootDir,
            },
        },
        settings: {
            "import/resolver": {
                typescript: {
                    project: sharedPackageProjects,
                },
            },
        },
        rules: {
            "import/no-unresolved": "error",
            "@typescript-eslint/no-unused-vars": "warn",
        },
    },
];
