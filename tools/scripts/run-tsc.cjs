#!/usr/bin/env node
const { spawn } = require("node:child_process");

function resolveTypeScriptBin() {
    try {
        return require.resolve("typescript/bin/tsc", { paths: [process.cwd()] });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : String(error);
        console.error("Impossible de résoudre le binaire TypeScript:", message);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
const tscPath = resolveTypeScriptBin();

const child = spawn(
    process.execPath,
    ["--max-old-space-size=4096", tscPath, ...args],
    { stdio: "inherit" }
);

child.on("exit", (code, signal) => {
    if (signal) {
        process.exit(1);
    }
    process.exit(code ?? 0);
});

child.on("error", (error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
});
