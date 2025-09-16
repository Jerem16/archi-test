// scripts/lib/paths.cjs
const path = require("path");
const ROOT = process.cwd();

const norm = (p) => p.replace(/\\/g, "/");
const toRel = (p) => {
    const n = norm(p);
    const rel = path.isAbsolute(n)
        ? path.relative(ROOT, n)
        : n.replace(/^\.\//, "");
    return norm(rel);
};


// Extensions prises en compte pour le graphe
const EXTS = ["ts", "tsx", "js", "jsx", "mjs", "cjs"];

const PROTECTED_GLOBS = [
    // "app/**",
    // "src/components/header/**",
    // "src/components/frames/**",
];

module.exports = { ROOT, norm, toRel, PROTECTED_GLOBS, EXTS };
