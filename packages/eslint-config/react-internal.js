import eslintConfigPrettier from "eslint-config-prettier";
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
        plugins: { "react-hooks": pluginReactHooks },
        settings: { react: { version: "detect" } },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.serviceworker,
            },
        },
    },

    // Neutralise les conflits formatage
    eslintConfigPrettier,
];
