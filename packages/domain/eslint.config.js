import baseConfig from "../eslint.config.mjs";

export default [
    {
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.json"],
                tsconfigRootDir: new URL(".", import.meta.url).pathname,
            },
        },
    },
    ...baseConfig,
];
