/* scripts/keep-list.cjs
 * Produit :
 *   - keep/keep-list.txt          → fichiers à CONSERVER (reachables)
 *   - keep/delete-candidates.txt  → candidats à suppression (all - keep)
 *
 * Points clés :
 *  - Entrées Next App Router : page/layout/route/loading/error/not-found/template + middleware
 *  - Résolution alias via tsconfig (apps/web/tsconfig.json prioritaire)
 *  - SCSS via sass-graph (optionnel)
 *  - ⚠️ AUCUNE protection globale "app/**" (pour autoriser la suppression de fichiers morts dans app/)
 */

const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");
const madge = require("madge");
let sassGraph;
try {
    sassGraph = require("sass-graph");
} catch {}

const ROOT = process.cwd();

/** --------- Configuration ajustable --------- **/

// Mets null si tu ne veux pas suivre un bundle SCSS principal
const SCSS_ENTRY = path.join("src", "assets", "styles", "main.scss");

// Dossiers/fichiers jamais proposés à la suppression (garde spécifiques)
const PROTECTED_GLOBS = [
    "src/components/header/**",
    "src/components/frames/**",
];

// Extensions cataloguées (inventaire global)
const ALL_EXTS = [
    "ts",
    "tsx",
    "js",
    "jsx",
    "mjs",
    "cjs",
    "scss",
    "sass",
    "css",
    "json",
    "svg",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
    "ico",
    "avif",
];

// Extensions suivies par le graphe
const MADGE_EXTS = [
    "ts",
    "tsx",
    "js",
    "jsx",
    "mjs",
    "cjs",
    "scss",
    "sass",
    "css",
    "json",
    "svg",
];

// Globs d’ignore
const IGNORE = [
    "**/node_modules/**",
    "package.json",
    "tsconfig.json",
    "next.config.*",
    "postcss.config.js",
    "tailwind.config.js",
    ".eslintrc.js",
    ".eslintrc.cjs",
    ".eslintrc.json",
    ".prettierrc",
    "global.d.ts",
    "next-env.d.ts",
    ".prettierrc.js",
    ".prettierrc.cjs",
    "public/**",
    "scripts/**",
    "tools/**",
    ".next/**",
    "dist/**",
    "build/**",
    "coverage/**",
    ".turbo/**",
    ".git/**",
    "keep/**",
    "**/*.test.*",
    "**/*.spec.*",
    "**/*.stories.*",
    "**/__tests__/**",
];

/** --------- Utils --------- **/

const norm = (p) => p.replace(/\\/g, "/");
const rel = (p) => norm(path.relative(ROOT, p));
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
function unique(arr) {
    return [...new Set(arr)];
}

function detectTsConfig() {
    const env = process.env.APP_TSCONFIG;
    const candidates = [
        env && env.trim(),
        "apps/web/tsconfig.json",
        "tsconfig.json",
    ].filter(Boolean);
    for (const p of candidates) {
        const abs = path.join(ROOT, p);
        if (fs.existsSync(abs)) return p;
    }
    return undefined;
}

async function findNextEntrypoints() {
    const patterns = [
        "app/**/layout.@(ts|tsx|js|jsx)",
        "app/**/page.@(ts|tsx|js|jsx)",
        "app/**/route.@(ts|tsx|js|jsx)",
        "app/**/loading.@(ts|tsx|js|jsx)",
        "app/**/error.@(ts|tsx|js|jsx)",
        "app/**/not-found.@(ts|tsx|js|jsx)",
        "app/**/template.@(ts|tsx|js|jsx)",
        "middleware.@(ts|js)",
    ];
    const entries = await fg(patterns, { dot: true, ignore: IGNORE });
    return unique(entries.map(rel));
}

async function buildMadgeGraph(entryPoints) {
    const tsConfigPath = detectTsConfig();
    const res = await madge(entryPoints, {
        baseDir: ROOT,
        tsConfig: tsConfigPath,
        fileExtensions: MADGE_EXTS,
        detectiveOptions: { es6: { mixedImports: true } },
        includeNpm: false,
    });
    return res.obj(); // { file: [deps...] }
}

function collectReachable(graphObj, entryPoints) {
    const keep = new Set();
    const q = [...entryPoints.map(norm)];
    while (q.length) {
        const f = norm(q.shift());
        if (keep.has(f)) continue;
        keep.add(f);
        const deps = graphObj[f] || graphObj[rel(path.join(ROOT, f))] || [];
        for (let d of deps) {
            if (!d) continue;
            d = norm(d);
            q.push(d);
        }
    }
    return keep;
}

function expandGlobs(globs) {
    if (!globs || globs.length === 0) return [];
    const files = fg.sync(globs, { dot: true, ignore: IGNORE });
    return unique(files.map(rel));
}

function scssReachable(entryRelPath) {
    if (!sassGraph || !entryRelPath) return [];
    const abs = path.join(ROOT, entryRelPath);
    if (!fs.existsSync(abs)) return [];
    const g = sassGraph.parseFile(abs, { loadPaths: [path.dirname(abs)] });
    return unique(Object.keys(g.index).map(rel));
}

/** --------- Main --------- **/

(async () => {
    ensureDir(path.join(ROOT, "keep"));

    // 1) Entrées Next
    const entryNext = await findNextEntrypoints();
    if (entryNext.length === 0) {
        console.warn(
            "⚠️ Aucune entrée trouvée sous app/** — vérifie l’architecture."
        );
    }

    // 2) Graphe reachables
    const keepFromGraph = new Set();
    if (entryNext.length) {
        const graph = await buildMadgeGraph(entryNext);
        const reachable = collectReachable(graph, entryNext);
        for (const f of reachable) keepFromGraph.add(f);
    }

    // 3) SCSS principal + dépendances
    const keepScss = scssReachable(SCSS_ENTRY);
    for (const f of keepScss) keepFromGraph.add(f);

    // 4) Globs protégés (spécifiques, pas app/**)
    const protectedFiles = expandGlobs(PROTECTED_GLOBS);
    for (const f of protectedFiles) keepFromGraph.add(f);

    // 5) Inventaire global
    const allFiles = await fg([`**/*.@(${ALL_EXTS.join("|")})`], {
        dot: true,
        ignore: IGNORE,
    });
    const allRel = unique(allFiles.map(rel));

    // 6) Listes finales
    const keepList = unique([...keepFromGraph]).sort();
    const keepSet = new Set(keepList);

    const deleteCandidates = allRel.filter((f) => !keepSet.has(norm(f))).sort();

    // 7) Écriture
    fs.writeFileSync(
        path.join(ROOT, "keep", "keep-list.txt"),
        keepList.join("\n"),
        "utf8"
    );
    fs.writeFileSync(
        path.join(ROOT, "keep", "delete-candidates.txt"),
        deleteCandidates.join("\n"),
        "utf8"
    );

    // 8) Récap JSON (debug CI)
    const summary = {
        root: ROOT,
        tsconfigUsed: detectTsConfig() || null,
        entryCount: entryNext.length,
        protectedCount: protectedFiles.length,
        scssReachableCount: keepScss.length,
        keepCount: keepList.length,
        deleteCandidatesCount: deleteCandidates.length,
        examples: {
            entries: entryNext.slice(0, 10),
            keep: keepList.slice(0, 10),
            deleteCandidates: deleteCandidates.slice(0, 10),
        },
    };
    fs.writeFileSync(
        path.join(ROOT, "keep", "summary-keep-list.json"),
        JSON.stringify(summary, null, 2)
    );

    console.log(`✅ keep/keep-list.txt (${keepList.length} items)`);
    console.log(
        `🧹 keep/delete-candidates.txt (${deleteCandidates.length} items)`
    );
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
