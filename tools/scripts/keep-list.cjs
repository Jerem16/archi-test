/* scripts/keep-list.cjs */
const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");
const madge = require("madge");
let sassGraph;
try {
    sassGraph = require("sass-graph");
} catch (_) {}

const ROOT = process.cwd();
const SCSS_ENTRY = path.join("src", "assets", "styles", "main.scss"); // <-- CHANGE si besoin
const PROTECTED_GLOBS = [
    "app/**",
    "src/components/header/**",
    "src/components/frames/**",
];
const ALWAYS_KEEP = [
    "package.json",
    "tsconfig.json",
    "next.config.js",
    "postcss.config.js",
    "tailwind.config.js",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.json",
    ".prettierrc",
    ".prettierrc.js",
    ".prettierrc.cjs",
    "public/**",
];

const exts = ["ts", "tsx", "js", "jsx", "cjs", "mjs", "scss", "sass", "css"];
const IGNORE = [
    "node_modules/**",
    ".next/**",
    "out/**",
    "dist/**",
    "build/**",
    "coverage/**",
    "**/*.test.*",
    "**/*.spec.*",
    "**/__tests__/**",
];

const uniq = (arr) => [...new Set(arr.map((p) => p.replace(/\\/g, "/")))];
const exists = (p) => fs.existsSync(path.join(ROOT, p));

(async () => {
    // 1) Entrées: layouts (base demandée). Tu peux en ajouter d'autres si besoin.
    const entryLayouts = uniq(
        await fg(["app/**/layout.@(ts|tsx|js|jsx)"], {
            ignore: IGNORE,
            dot: true,
        })
    );
    if (entryLayouts.length === 0) {
        console.warn(
            "⚠️ Aucun layout trouvé sous app/**/layout.* — vérifie l’architecture."
        );
    }

    // 2) Graphe JS/TS via madge
    const entryPoints = entryLayouts.length ? entryLayouts : [];
    const keepFromGraph = new Set();

    if (entryPoints.length) {
        const res = await madge(entryPoints, {
            tsConfig: exists("tsconfig.json") ? "tsconfig.json" : undefined,
            fileExtensions: exts,
            detectiveOptions: { es6: { mixedImports: true } },
            baseDir: ROOT,
        });
        // BFS sur l’objet de dépendances
        const obj = res.obj();
        const stack = [...entryPoints];
        while (stack.length) {
            const cur = stack.pop();
            if (!cur || keepFromGraph.has(cur)) continue;
            keepFromGraph.add(cur);
            const deps = obj[cur] || [];
            deps.forEach((d) => {
                const rel = d.startsWith(".")
                    ? path.normalize(path.join(path.dirname(cur), d))
                    : d;
                stack.push(rel);
            });
        }
    }

    // 3) Chaîne SCSS: suit tous les @import depuis le fichier d’entrée
    const keepFromScss = new Set();
    const scssEntryFile = SCSS_ENTRY.replace(/\\/g, "/");
    if (exists(scssEntryFile) && sassGraph) {
        const graph = sassGraph.parseFile(path.join(ROOT, scssEntryFile));
        const seen = new Set();
        const walk = (f) => {
            const rel = path.relative(ROOT, f).replace(/\\/g, "/");
            if (seen.has(rel)) return;
            seen.add(rel);
            keepFromScss.add(rel);
            (graph.index[f]?.imports || []).forEach((i) => {
                const abs = path.isAbsolute(i)
                    ? i
                    : path.resolve(path.dirname(f), i);
                if (fs.existsSync(abs)) walk(abs);
            });
        };
        walk(path.join(ROOT, scssEntryFile));
    } else {
        console.warn(
            `ℹ️ SCSS: entrée "${scssEntryFile}" introuvable ou sass-graph non installé — étape ignorée.`
        );
    }

    // 4) Ajoute zones protégées et fichiers à garder “toujours”
    const protectedFiles = uniq(
        await fg(PROTECTED_GLOBS, { dot: true, onlyFiles: true })
    );
    const alwaysKeep = uniq(await fg(ALWAYS_KEEP, { dot: true }));

    // 5) Ensemble final KEEP
    const keepSet = new Set(
        [
            ...keepFromGraph,
            ...keepFromScss,
            ...protectedFiles,
            ...alwaysKeep,
        ].map((p) => p.replace(/\\/g, "/"))
    );

    // 6) Tous les fichiers candidats (code + styles)
    const allFiles = uniq(
        await fg(
            [
                `**/*.{${exts.join(",")}}`,
                "!**/*.d.ts",
                "!**/*.map",
                "!**/*.min.*",
                ...IGNORE.map((p) => "!" + p),
            ],
            { dot: true }
        )
    );

    // 7) À supprimer potentiels = ALL - KEEP
    const deleteCandidates = allFiles.filter((p) => !keepSet.has(p));

    // 8) Écrit les rapports
    fs.mkdirSync(path.join(ROOT, "keep"), { recursive: true });
    fs.writeFileSync(
        path.join(ROOT, "keep", "keep-list.txt"),
        [...keepSet].sort().join("\n"),
        "utf8"
    );
    fs.writeFileSync(
        path.join(ROOT, "keep", "delete-candidates.txt"),
        deleteCandidates.sort().join("\n"),
        "utf8"
    );
    fs.writeFileSync(
        path.join(ROOT, "keep", "summary.json"),
        JSON.stringify(
            {
                entryLayouts,
                counts: {
                    keep: keepSet.size,
                    deleteCandidates: deleteCandidates.length,
                    totalScanned: allFiles.length,
                },
            },
            null,
            2
        )
    );

    console.log(`✅ keep/keep-list.txt (${keepSet.size} items)`);
    console.log(
        `🧹 keep/delete-candidates.txt (${deleteCandidates.length} items)`
    );
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
