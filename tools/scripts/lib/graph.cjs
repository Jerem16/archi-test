// scripts/lib/graph.cjs
const path = require("path");
const madge = require("madge");
const { ROOT, norm, EXTS } = require("./paths.cjs");

async function reachableFilesFrom(entries) {
    if (!entries || !entries.length) return [];
    const res = await madge(entries, {
        tsConfig: "tsconfig.json",
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

module.exports = { reachableFilesFrom };
