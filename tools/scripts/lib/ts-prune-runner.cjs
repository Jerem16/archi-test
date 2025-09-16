// scripts/lib/ts-prune-runner.cjs
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { ROOT, toRel } = require("./paths.cjs");

function run(cmd, args) {
    try {
        const out = spawnSync(cmd, args, {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        });
        return (out.stdout || "").toString();
    } catch {
        return "";
    }
}

function parseTsPruneStdout(stdout) {
    const items = (stdout || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
            const [rawFile, symbol] = line.split(" - ");
            if (!rawFile || !symbol) return null;
            const fileOnly = rawFile.split(":")[0];
            const rel = toRel(fileOnly);
            return { file: rel, symbol: symbol.trim() };
        })
        .filter(Boolean)
        .filter(
            (it) =>
                !it.file.startsWith("node_modules/") &&
                !it.file.startsWith(".next/") &&
                !it.file.match(/\.(test|spec)\.[cm]?(t|j)sx?$/)
        )
        // ignore exports spéciaux Next.js dans app/**
        .filter((it) => {
            if (!it.file.startsWith("app/")) return true;
            const s = it.symbol;
            const isNextSpecial =
                s === "default" ||
                s === "metadata" ||
                /^generate[A-Z]/.test(s) ||
                /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(s) ||
                /(\/|^)(loading|error|not-found|template)\.(t|j)sx?$/.test(
                    it.file
                );
            return !isNextSpecial;
        });

    return Array.isArray(items) ? items : [];
}

function runTsPrune() {
    let stdout = "";
    try {
        const pkgPath = require.resolve("ts-prune/package.json", {
            paths: [ROOT],
        });
        const binField = require(pkgPath).bin;
        const binRel =
            typeof binField === "string" ? binField : binField["ts-prune"];
        const binPath = path.resolve(path.dirname(pkgPath), binRel);
        stdout = run(process.execPath, [binPath]);
    } catch {
        const yarnCmd = process.platform === "win32" ? "yarn.cmd" : "yarn";
        stdout = run(yarnCmd, ["dlx", "ts-prune"]);
        if (!stdout.trim()) {
            const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
            stdout = run(npxCmd, ["-y", "ts-prune"]);
        }
    }

    fs.mkdirSync(path.join(ROOT, "keep"), { recursive: true });
    fs.writeFileSync(
        path.join(ROOT, "keep", "ts-prune.raw.txt"),
        stdout || "",
        "utf8"
    );
    return parseTsPruneStdout(stdout);
}

module.exports = { runTsPrune };
