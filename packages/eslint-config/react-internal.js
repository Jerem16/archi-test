import eslintConfigPrettier from "eslint-config-prettier";
import pluginImport from "eslint-plugin-import";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import baseConfig from "./base.js";

/**
 * Config React pour libs/app (sans recharger @typescript-eslint déjà fourni par base.js)
 */
export const config = [
    // base: JS + TS (typed) + prettier + globals
    ...baseConfig,

    // React
    pluginReact.configs.flat.recommended,

    // Hooks
    {
        plugins: {
            "react-hooks": pluginReactHooks,
            import: pluginImport,
        },
        settings: {
            react: { version: "detect" },
            "import/core-modules": ["typescript-eslint"],
        },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/jsx-no-undef": "error", // ton cas de test sur <AuthProvider>
            "react/react-in-jsx-scope": "off",

            // miroirs d’erreurs tsc pour tes alias/paths
            "import/no-unresolved": "error",
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.serviceworker,
            },
        },
    },
    {
        files: ["**/*.{ts,tsx,cts,mts}"],
        rules: {
            // ↓ Bruit TS côté UI (ne change pas les règles Next)
            "@typescript-eslint/no-unsafe-call": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn",
            "@typescript-eslint/no-unsafe-return": "warn",
            "@typescript-eslint/no-redundant-type-constituents": "warn",
        },
    },

    // Neutralise les conflits formatage
    eslintConfigPrettier,
];
