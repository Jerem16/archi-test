// scripts/lib/unused-from-eslint.cjs
const { spawnSync } = require("child_process");
const path = require("path");
const { ROOT, toRel } = require("./paths.cjs");

function run(cmd, args) {
    try {
        const out = spawnSync(cmd, args, {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        });
        return {
            stdout: (out.stdout || "").toString(),
            stderr: (out.stderr || "").toString(),
            status: out.status ?? 0,
        };
    } catch (error) {
        const message =
            error instanceof Error
                ? error.stack || error.message
                : String(error);
        return { stdout: "", stderr: message, status: 1 };
    }
}

function pickLocalFunctionUnused(messages, filePath, sourceText) {
    // Filtre @typescript-eslint/no-unused-vars et heuristique "function" / "const fn"
    const res = [];
    for (const m of messages || []) {
        if (m.ruleId !== "@typescript-eslint/no-unused-vars") continue;
        // Extrait le nom entre quotes: "'test' is defined but never used."
        const match = m.message.match(/^'([^']+)' is defined but never used/);
        if (!match) continue;
        const name = match[1];

        // Heuristique: regarde la ligne pour voir si c'est une function locale
        // (couvre `function test(` et `const test = (` / `const test = function`)
        const lineIdx = (m.line || 1) - 1;
        const lines = sourceText.split(/\r?\n/);
        const L = lines[lineIdx] || "";
        const isFuncDecl = /\bfunction\s+([A-Za-z0-9_$]+)\s*\(/.test(L);
        const isConstFn = new RegExp(
            `\\bconst\\s+${name}\\s*=\\s*(\\(|function\\s*\\()`
        ).test(L);
        const isLikelyFunction = isFuncDecl || isConstFn;

        if (isLikelyFunction) {
            res.push({
                file: toRel(filePath),
                name,
                kind: isFuncDecl ? "function" : "const-fn",
                line: m.line,
                character: m.column,
            });
        }
    }
    return res;
}

function collectFromEslint() {
    // 1) essaie binaire local
    let cmd = process.execPath;
    let args = [];
    try {
        const pkgPath = require.resolve("eslint/package.json", {
            paths: [ROOT],
        });
        const binField = require(pkgPath).bin;
        const binRel =
            typeof binField === "string" ? binField : binField["eslint"];
        const binPath = path.resolve(path.dirname(pkgPath), binRel);
        args = [binPath, ".", "-f", "json", "--no-error-on-unmatched-pattern"];
    } catch {
        // 2) yarn dlx, 3) npx
        cmd = process.platform === "win32" ? "yarn.cmd" : "yarn";
        args = [
            "dlx",
            "eslint",
            ".",
            "-f",
            "json",
            "--no-error-on-unmatched-pattern",
        ];
    }

    const { stdout } = run(cmd, args);
    let parsed;
    try {
        parsed = JSON.parse(stdout || "[]");
    } catch {
        parsed = [];
    }

    // Construit une map file->source pour l’heuristique
    const fs = require("fs");
    const results = [];
    for (const fileRes of parsed) {
        const file = fileRes.filePath;
        let src = "";
        try {
            src = fs.readFileSync(file, "utf8");
        } catch {}
        results.push(...pickLocalFunctionUnused(fileRes.messages, file, src));
    }
    return results;
}

module.exports = { collectFromEslint };
