// scripts/keep-functions.cjs
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./lib/paths.cjs");
const { runTsPrune } = require("./lib/ts-prune-runner.cjs");
const { collectFromEslint } = require("./lib/unused-from-eslint.cjs");

// Optionnel: on charge l’AST maison si présent
let analyzeLocalUnusedFunctions = null;
try {
    ({ analyzeLocalUnusedFunctions } = require("./lib/ts-ast-unused.cjs"));
} catch {}

(async () => {
    // 1) Exports inutilisés par ts-prune
    const unusedExports = runTsPrune(); // [{file, symbol}]
    // 2) Fonctions locales inutilisées (ESLint)
    let unusedLocals = collectFromEslint(); // [{file, name, kind, line, character}]

    // 3) Fallback AST (si demandé et si ESLint n’a rien trouvé)
    if (
        (!unusedLocals || unusedLocals.length === 0) &&
        analyzeLocalUnusedFunctions &&
        process.env.FALLBACK_AST === "1"
    ) {
        try {
            const astFindings = analyzeLocalUnusedFunctions();
            if (Array.isArray(astFindings) && astFindings.length) {
                unusedLocals = astFindings;
            }
        } catch {}
    }

    fs.mkdirSync(path.join(ROOT, "keep"), { recursive: true });

    fs.writeFileSync(
        path.join(ROOT, "keep", "summary-functions.json"),
        JSON.stringify(
            {
                counts: {
                    unusedExports: Array.isArray(unusedExports)
                        ? unusedExports.length
                        : 0,
                    unusedLocalFunctions: Array.isArray(unusedLocals)
                        ? unusedLocals.length
                        : 0,
                },
            },
            null,
            2
        ),
        "utf8"
    );

    console.log(
        `🔎 Exports non utilisés: ${
            Array.isArray(unusedExports) ? unusedExports.length : 0
        } → keep/ts-prune.raw.txt`
    );

    console.log("✅ Résumé → keep/summary-functions.json");
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
