// scripts/lib/entries.cjs
const fg = require("fast-glob");
const { norm, IGNORE } = require("./paths.cjs");

async function findLayoutEntries() {
    const entries = await fg(["app/**/layout.@(ts|tsx|js|jsx)"], {
        dot: true,
        ignore: IGNORE,
    });
    return [...new Set(entries.map(norm))];
}

module.exports = { findLayoutEntries };
