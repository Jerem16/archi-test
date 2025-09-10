/* scripts/keep-functions.cjs */
const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");
const madge = require("madge");
const ts = require("typescript");
const { spawnSync } = require("child_process");

const ROOT = process.cwd();
const PROTECTED_GLOBS = [
    "app/**",
    "src/components/header/**",
    "src/components/frames/**",
];
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
const EXTS = ["ts", "tsx", "js", "jsx", "cjs", "mjs"];

const norm = (p) => p.replace(/\\/g, "/");
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

// ---------- 1) Entrées = layouts ----------
async function findLayoutEntries() {
    const entries = await fg(["app/**/layout.@(ts|tsx|js|jsx)"], {
        dot: true,
        ignore: IGNORE,
    });
    return [...new Set(entries.map(norm))];
}

// ---------- 2) Graphe de dépendances (fichiers atteignables) ----------
async function reachableFilesFrom(entries) {
    if (!entries.length) return [];
    const res = await madge(entries, {
        tsConfig: exists("tsconfig.json") ? "tsconfig.json" : undefined,
        fileExtensions: EXTS,
        detectiveOptions: { es6: { mixedImports: true } },
        baseDir: ROOT,
    });
    const obj = res.obj();
    const keep = new Set();
    const stack = [...entries];
    while (stack.length) {
        const cur = norm(stack.pop());
        if (!cur || keep.has(cur)) continue;
        keep.add(cur);
        const deps = obj[cur] || [];
        deps.forEach((d) => {
            const rel = d.startsWith(".")
                ? norm(path.join(path.dirname(cur), d))
                : norm(d);
            stack.push(rel);
        });
    }
    return [...keep].filter((f) => EXTS.some((e) => f.endsWith("." + e)));
}

// ---------- 3) Exports non utilisés (ts-prune) ----------
function runTsPrune(reachable) {
    const ROOT = process.cwd();
    const { spawnSync } = require("child_process");
    const path = require("path");
    const norm = (p) => p.replace(/\\/g, "/");

    const run = (cmd, args) => {
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
    };

    // 1) Préférence : binaire local (OK avec Yarn PnP)
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
        // 2) Fallback Yarn Berry
        const yarnCmd = process.platform === "win32" ? "yarn.cmd" : "yarn";
        stdout = run(yarnCmd, ["dlx", "ts-prune"]);
        // 3) Fallback npx
        if (!stdout.trim()) {
            const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
            stdout = run(npxCmd, ["-y", "ts-prune"]);
        }
    }

    const lines = (stdout || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

    // Format ts-prune: "src/foo/bar.ts#exportName"
    const items = lines
        .map((line) => {
            const [file, symbol] = line.split("#");
            return file && symbol ? { file: norm(file), symbol } : null;
        })
        .filter(Boolean);

    // Filtre aux fichiers atteignables (et zones protégées)
    const fg = require("fast-glob");
    const protectedFiles = new Set(
        fg
            .sync(
                [
                    "app/**",
                    "src/components/header/**",
                    "src/components/frames/**",
                ],
                {
                    dot: true,
                    onlyFiles: true,
                }
            )
            .map(norm)
    );
    const reachableSet = new Set((reachable || []).map(norm));

    return items.filter(
        (it) => reachableSet.has(it.file) || protectedFiles.has(it.file)
    );
}

// ---------- 4) Fonctions locales non référencées ----------
function analyzeLocalUnusedFunctions(reachable) {
    // Charge tsconfig
    const cfgPath =
        ts.findConfigFile(ROOT, ts.sys.fileExists, "tsconfig.json") || "";
    const cfg = cfgPath
        ? ts.readConfigFile(cfgPath, ts.sys.readFile).config
        : { compilerOptions: { jsx: "react-jsx" } };

    cfg.compilerOptions = {
        ...(cfg.compilerOptions || {}),
        noEmit: true,
        skipLibCheck: true,
        jsx: cfg.compilerOptions?.jsx || "react-jsx",
    };
    const parsed = ts.parseJsonConfigFileContent(
        cfg,
        ts.sys,
        ROOT,
        undefined,
        cfgPath || "tsconfig.json"
    );

    // Restreint aux fichiers atteignables
    const fileSet = new Set(reachable.map((p) => path.resolve(ROOT, p)));
    const rootNames = parsed.fileNames.filter((f) => fileSet.has(f));

    const program = ts.createProgram({
        rootNames,
        options: parsed.options,
    });
    const checker = program.getTypeChecker();

    const results = []; // {file, name, kind, line, character}

    function isExported(node) {
        return (
            (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !==
                0 ||
            (!!node.parent &&
                ts.isSourceFile(node.parent) &&
                node.parent.statements.some(
                    (s) =>
                        ts.isExportDeclaration(s) &&
                        s.exportClause &&
                        ts.isNamedExports(s.exportClause) &&
                        s.exportClause.elements.some(
                            (e) =>
                                e.name.getText() ===
                                (node.name && node.name.getText())
                        )
                ))
        );
    }

    function collectLocalFunctionDecls(sf) {
        const decls = [];
        function visit(node) {
            // function foo() {}
            if (ts.isFunctionDeclaration(node) && node.name) {
                if (!isExported(node))
                    decls.push({
                        node,
                        name: node.name.getText(),
                        kind: "function",
                    });
            }
            // const foo = () => {} | function() {}
            if (
                ts.isVariableStatement(node) &&
                !node.modifiers?.some(
                    (m) => m.kind === ts.SyntaxKind.ExportKeyword
                )
            ) {
                node.declarationList.declarations.forEach((d) => {
                    const n =
                        d.name && ts.isIdentifier(d.name)
                            ? d.name.getText()
                            : null;
                    const init = d.initializer;
                    if (
                        n &&
                        init &&
                        (ts.isArrowFunction(init) ||
                            ts.isFunctionExpression(init))
                    ) {
                        decls.push({ node: d, name: n, kind: "const-fn" });
                    }
                });
            }
            // class Foo { method() {} } (méthodes non exportées directement)
            if (
                ts.isMethodDeclaration(node) &&
                node.name &&
                ts.isIdentifier(node.name)
            ) {
                // On ignore les méthodes de classe exportées via "export class"
                const cls = node.parent;
                const clsExported =
                    ts.getCombinedModifierFlags(cls) & ts.ModifierFlags.Export;
                if (!clsExported) {
                    decls.push({
                        node,
                        name: node.name.getText(),
                        kind: "method",
                    });
                }
            }
            ts.forEachChild(node, visit);
        }
        visit(sf);
        return decls;
    }

    function countReferencesInFile(sf, targetSym) {
        let hits = 0;
        function visit(node) {
            // Identifiant JSX: <Foo /> → référence au symbole de Foo
            if (
                ts.isJsxOpeningElement(node) ||
                ts.isJsxSelfClosingElement(node)
            ) {
                const nm = node.tagName;
                const sym = checker.getSymbolAtLocation(nm);
                if (sym && sym === targetSym) hits++;
            }
            // Identifiant classique
            if (ts.isIdentifier(node)) {
                const sym = checker.getSymbolAtLocation(node);
                if (sym && sym === targetSym) {
                    // Évite de compter la définition elle-même
                    const decl =
                        sym.valueDeclaration ||
                        (sym.declarations && sym.declarations[0]);
                    if (
                        !(
                            decl &&
                            decl.pos === node.pos &&
                            decl.end === node.end
                        )
                    ) {
                        hits++;
                    }
                }
            }
            ts.forEachChild(node, visit);
        }
        visit(sf);
        return hits;
    }

    for (const sf of program.getSourceFiles()) {
        if (!fileSet.has(sf.fileName)) continue;
        if (sf.isDeclarationFile) continue;

        const decls = collectLocalFunctionDecls(sf);
        for (const d of decls) {
            const id =
                d.node.name && ts.isIdentifier(d.node.name)
                    ? d.node.name
                    : ts.isVariableDeclaration(d.node) &&
                      ts.isIdentifier(d.node.name)
                    ? d.node.name
                    : null;

            if (!id) continue;
            const sym = checker.getSymbolAtLocation(id);
            if (!sym) continue;

            const refs = countReferencesInFile(sf, sym);
            if (refs === 0) {
                const { line, character } = ts.getLineAndCharacterOfPosition(
                    sf,
                    id.getStart()
                );
                results.push({
                    file: norm(path.relative(ROOT, sf.fileName)),
                    name: id.getText(),
                    kind: d.kind,
                    line: line + 1,
                    character: character + 1,
                });
            }
        }
    }
    return results.sort((a, b) =>
        a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)
    );
}

// ---------- main ----------
(async () => {
    const entryLayouts = await findLayoutEntries();
    if (!entryLayouts.length) {
        console.warn(
            "⚠️ Aucun layout trouvé sous app/**/layout.* — vérifie l’architecture."
        );
    }

    const reachable = await reachableFilesFrom(entryLayouts);

    // 1) Exports non utilisés (filtrés sur reachable + protégés)
    const unusedExports = runTsPrune(reachable);

    // 2) Fonctions locales non référencées (dans reachable uniquement)
    const unusedLocals = analyzeLocalUnusedFunctions(reachable);

    // 3) Écriture rapports
    ensureDir(path.join(ROOT, "keep"));

    fs.writeFileSync(
        path.join(ROOT, "keep", "unused-exports.txt"),
        unusedExports
            .map((e) => `${e.file}#${e.symbol}`)
            .sort()
            .join("\n"),
        "utf8"
    );

    fs.writeFileSync(
        path.join(ROOT, "keep", "unused-local-functions.json"),
        JSON.stringify(unusedLocals, null, 2),
        "utf8"
    );

    fs.writeFileSync(
        path.join(ROOT, "keep", "summary-functions.json"),
        JSON.stringify(
            {
                entryLayouts,
                counts: {
                    reachable: reachable.length,
                    unusedExports: unusedExports.length,
                    unusedLocalFunctions: unusedLocals.length,
                },
            },
            null,
            2
        ),
        "utf8"
    );

    console.log(
        `🔎 Exports non utilisés: ${unusedExports.length} → keep/unused-exports.txt`
    );
    console.log(
        `🔎 Fonctions locales non référencées: ${unusedLocals.length} → keep/unused-local-functions.json`
    );
    console.log("✅ Résumé → keep/summary-functions.json");
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
