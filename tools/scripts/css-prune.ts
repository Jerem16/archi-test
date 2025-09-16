import fs from "node:fs";
import path from "node:path";

const uniq = <T>(arr: T[]) => [...new Set(arr)];

function mergeArrays(a?: string[], b?: string[]) {
    return uniq([...(a ?? []), ...(b ?? [])]);
}

function mergeKeep(a: any = {}, b: any = {}) {
    return {
        classes: mergeArrays(a.classes, b.classes),
        prefixes: mergeArrays(a.prefixes, b.prefixes),
        regex: mergeArrays(a.regex, b.regex),
        ids: mergeArrays(a.ids, b.ids),
    };
}

function mergeJsonFile(filePath: string, incoming: any) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(incoming, null, 2));
        return;
    }
    const current = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const merged = {
        ...current,
        ...incoming,
        keep: mergeKeep(current.keep, incoming.keep),
        include: mergeArrays(current.include, incoming.include),
        exclude: mergeArrays(current.exclude, incoming.exclude),
        strictCompoundPrune:
            incoming.strictCompoundPrune ?? current.strictCompoundPrune,
    };
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2));
}

function loadKeepList(projectRoot: string) {
    try {
        const p = path.join(projectRoot, "keep-list.cjs");
        if (!fs.existsSync(p))
            return { classes: [], prefixes: [], regex: [], ids: [] };
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(p);
        return mergeKeep(mod, {});
    } catch {
        return { classes: [], prefixes: [], regex: [], ids: [] };
    }
}

function extractErrorOutput(error: unknown): string {
    if (typeof error === "object" && error !== null && "stderr" in error) {
        const stderr = (error as { stderr?: unknown }).stderr;
        if (typeof stderr === "string") {
            return stderr;
        }
        if (
            stderr &&
            typeof (stderr as { toString: () => string }).toString === "function"
        ) {
            try {
                return (stderr as { toString: () => string }).toString();
            } catch {
                // ignore error when stringifying stderr
            }
        }
    }
    if (error instanceof Error) {
        return error.stack ?? error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
}

async function loadKeepFunctions(projectRoot: string) {
    try {
        const p = path.join(projectRoot, "keep-functions.cjs");
        if (!fs.existsSync(p))
            return { classes: [], prefixes: [], regex: [], ids: [] };
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(p);
        const out =
            typeof mod === "function" ? await mod({ projectRoot }) : mod;
        return mergeKeep(out, {});
    } catch {
        return { classes: [], prefixes: [], regex: [], ids: [] };
    }
}

/** Écrire/mettre à jour un fichier SANS l’écraser si déjà présent (region replace optionnelle). */
function writeFileIdempotent(filePath: string, content: string) {
    const START = "/* CSS-PRUNE AUTOGEN START */";
    const END = "/* CSS-PRUNE AUTOGEN END */";
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        return;
    }
    const prev = fs.readFileSync(filePath, "utf8");
    if (prev.includes(START) && prev.includes(END)) {
        const next = prev.replace(
            new RegExp(`${START}[\\s\\S]*?${END}`),
            `${START}\n${content}\n${END}`
        );
        fs.writeFileSync(filePath, next);
    } else {
        fs.writeFileSync(filePath, prev + `\n\n${START}\n${content}\n${END}\n`);
    }
}
/* CSS-PRUNE AUTOGEN START */
import { execSync } from "node:child_process";
import fg from "fast-glob";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import postcss from "postcss";
import postcssScss from "postcss-scss";
import selectorParser from "postcss-selector-parser";

type KeepConfig = {
    classes: string[];
    prefixes: string[];
    regex: string[];
    ids?: string[];
};

type Config = {
    include: string[];
    exclude: string[];
    keepBEMFamily: boolean;
    pruneCssModules: boolean;
    keep: KeepConfig;
    strictCompoundPrune?: boolean;
};

interface Options {
    apply: boolean;
    debug: boolean;
    configPath: string;
    include: string[];
    exclude: string[];
    keepBEMFamily: boolean | null;
    strictCompound: boolean;
}

const DEFAULT_CONFIG: Config = {
    include: ["**/*.{ts,tsx,js,jsx,html,mdx,css,scss}"],
    exclude: ["node_modules/**", ".next/**", "dist/**", "coverage/**", "reports/**"],
    keepBEMFamily: true,
    pruneCssModules: false,
    strictCompoundPrune: false,
    keep: {
        classes: [
            "main-nav",
            "active",
            "open",
            "is-open",
            "hidden",
            "active-section",
            "nav-link",
            "submenu",
        ],
        prefixes: ["btn-style_", "nav-", "main-nav"],
        regex: [],
        ids: ["__next"],
    },
};

function parseArgs(argv: string[]): Options {
    const opts: Options = {
        apply: false,
        debug: false,
        configPath: path.join(process.cwd(), "css-prune.config.json"),
        include: [],
        exclude: [],
        keepBEMFamily: null,
        strictCompound: false,
    };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--apply") opts.apply = true;
        else if (a === "--debug") opts.debug = true;
        else if (a === "--config") opts.configPath = path.resolve(argv[++i]);
        else if (a === "--include") opts.include = argv[++i].split(",").map((s) => s.trim());
        else if (a === "--exclude") opts.exclude = argv[++i].split(",").map((s) => s.trim());
        else if (a === "--strict-compound") opts.strictCompound = true;
        else if (a.startsWith("--keep-bem-family")) {
            const [, v] = a.split("=");
            opts.keepBEMFamily = v === undefined ? true : v !== "false";
        }
    }
    return opts;
}

function loadConfig(opts: Options): Config {
    const fileCfg = fs.existsSync(opts.configPath)
        ? JSON.parse(fs.readFileSync(opts.configPath, "utf8"))
        : {};
    let cfg: Config = {
        ...DEFAULT_CONFIG,
        ...fileCfg,
        keep: mergeKeep(DEFAULT_CONFIG.keep, fileCfg.keep),
        include: mergeArrays(DEFAULT_CONFIG.include, fileCfg.include),
        exclude: mergeArrays(DEFAULT_CONFIG.exclude, fileCfg.exclude),
        strictCompoundPrune:
            fileCfg.strictCompoundPrune ?? DEFAULT_CONFIG.strictCompoundPrune,
    };
    if (opts.include.length) cfg.include = mergeArrays(cfg.include, opts.include);
    if (opts.exclude.length) cfg.exclude = mergeArrays(cfg.exclude, opts.exclude);
    if (opts.keepBEMFamily !== null) cfg.keepBEMFamily = opts.keepBEMFamily;
    return cfg;
}

interface ScanResult {
    usedClasses: Set<string>;
    usedIds: Set<string>;
    dynamicPrefixes: Set<string>;
    dynamicFiles: Set<string>;
    cssModuleUsage: Map<string, Set<string>>;
    keyframes: Set<string>;
}

function splitClasses(str: string): string[] {
    return str
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean);
}

function addClasses(res: ScanResult, classes: string[]) {
    for (const c of classes) res.usedClasses.add(c);
}

function addIds(res: ScanResult, ids: string[]) {
    for (const id of ids) res.usedIds.add(id);
}

function addPrefix(res: ScanResult, p: string, file: string) {
    res.dynamicPrefixes.add(p);
    res.dynamicFiles.add(file);
}

function resolveExpr(
    node: any,
    file: string,
    res: ScanResult
): string[] {
    if (!node) return [];
    const t = node.type;
    if (t === "StringLiteral") {
        return splitClasses(node.value);
    }
    if (t === "TemplateLiteral") {
        const staticPart = node.quasis.map((q: any) => q.value.cooked || "").join("");
        if (node.expressions.length > 0) {
            res.dynamicFiles.add(file);
            node.quasis.forEach((q: any) => {
                const txt = q.value.cooked || "";
                const m = txt.match(/([A-Za-z0-9_-]+-)$/);
                if (m) res.dynamicPrefixes.add(m[1]);
            });
        }
        return splitClasses(staticPart);
    }
    if (t === "BinaryExpression" && node.operator === "+") {
        const left = resolveExpr(node.left, file, res);
        const right = resolveExpr(node.right, file, res);
        if (
            node.left.type === "StringLiteral" &&
            node.right.type !== "StringLiteral"
        ) {
            addPrefix(res, node.left.value, file);
        }
        if (
            node.right.type === "StringLiteral" &&
            node.left.type !== "StringLiteral"
        ) {
            addPrefix(res, node.right.value, file);
        }
        return [...left, ...right];
    }
    if (t === "ConditionalExpression") {
        return [
            ...resolveExpr(node.consequent, file, res),
            ...resolveExpr(node.alternate, file, res),
        ];
    }
    if (t === "LogicalExpression") {
        return [
            ...resolveExpr(node.left, file, res),
            ...resolveExpr(node.right, file, res),
        ];
    }
    if (t === "ArrayExpression") {
        const out: string[] = [];
        node.elements.forEach((el: any) => {
            out.push(...resolveExpr(el, file, res));
        });
        return out;
    }
    if (t === "ObjectExpression") {
        const out: string[] = [];
        node.properties.forEach((prop: any) => {
            if (prop.type === "ObjectProperty") {
                if (prop.key.type === "Identifier")
                    out.push(prop.key.name);
                else if (prop.key.type === "StringLiteral")
                    out.push(prop.key.value);
            }
        });
        return out;
    }
    res.dynamicFiles.add(file);
    return [];
}

function resolveIdExpr(node: any, file: string, res: ScanResult): string[] {
    if (!node) return [];
    const t = node.type;
    if (t === "StringLiteral") {
        return [node.value];
    }
    if (t === "TemplateLiteral") {
        if (node.expressions.length === 0) {
            return [node.quasis.map((q: any) => q.value.cooked || "").join("")];
        }
        res.dynamicFiles.add(file);
        return [];
    }
    res.dynamicFiles.add(file);
    return [];
}

function extractTokensFromSelector(str: string): {
    classes: string[];
    ids: string[];
} {
    const classes: string[] = [];
    const ids: string[] = [];
    selectorParser((root: any) => {
        root.walkClasses((c: any) => classes.push(c.value));
        root.walkIds((i: any) => ids.push(i.value));
    }).processSync(str);
    return { classes, ids };
}

function matchRegex(cls: string, patterns: string[]): boolean {
    return patterns.some((p) => {
        try {
            const re = new RegExp(p);
            return re.test(cls);
        } catch {
            return false;
        }
    });
}

function buildBEMFamilies(used: Set<string>): Set<string> {
    const fam = new Set<string>();
    for (const cls of used) {
        const [be] = cls.split("--");
        const [block, el] = be.split("__");
        fam.add(block);
        if (el) fam.add(`${block}__${el}`);
    }
    return fam;
}

function inBEMFamily(candidate: string, fam: Set<string>): boolean {
    for (const base of fam) {
        if (candidate === base) return true;
        if (candidate.startsWith(`${base}__`)) return true;
        if (candidate.startsWith(`${base}--`)) return true;
    }
    return false;
}

function scanFile(file: string, res: ScanResult) {
    const code = fs.readFileSync(file, "utf8");
    const rel = path.relative(process.cwd(), file);
    if (/\.(css|scss)$/.test(file)) {
        const root = postcss.parse(code, {
            from: file,
            parser: file.endsWith(".scss") ? postcssScss : undefined,
        });
        root.walkDecls(/^(animation|animation-name)$/i, (decl: any) => {
            splitClasses(decl.value.replace(/[,]/g, " ")).forEach((n) => {
                if (n && !/^(none|inherit|initial|unset)$/i.test(n))
                    res.keyframes.add(n);
            });
        });
        return;
    }
    let ast: any;
    try {
        ast = parse(code, {
            sourceType: "module",
            plugins: ["typescript", "jsx"],
        });
    } catch {
        res.dynamicFiles.add(rel);
        return;
    }
    const moduleImports = new Map<string, string>();
    traverse(ast, {
        ImportDeclaration(p: any) {
            const src = p.node.source.value;
            if (/\.module\.(css|scss)$/.test(src)) {
                const spec = p.node.specifiers.find((s: any) => s.type === "ImportDefaultSpecifier");
                if (spec) {
                    const modPath = path.resolve(path.dirname(file), src);
                    moduleImports.set(spec.local.name, path.relative(process.cwd(), modPath));
                }
            }
        },
        JSXAttribute(p: any) {
            const name = p.node.name.name;
            if (name === "className" || name === "class") {
                if (p.node.value?.type === "StringLiteral") {
                    addClasses(res, splitClasses(p.node.value.value));
                } else if (p.node.value?.type === "JSXExpressionContainer") {
                    addClasses(res, resolveExpr(p.node.value.expression, rel, res));
                }
            } else if (name === "id") {
                if (p.node.value?.type === "StringLiteral") {
                    addIds(res, [p.node.value.value]);
                } else if (p.node.value?.type === "JSXExpressionContainer") {
                    addIds(res, resolveIdExpr(p.node.value.expression, rel, res));
                }
            }
        },
        CallExpression(p: any) {
            const callee = p.node.callee;
            if (
                callee.type === "Identifier" &&
                (callee.name === "clsx" || callee.name === "classnames")
            ) {
                p.node.arguments.forEach((arg: any) => {
                    addClasses(res, resolveExpr(arg, rel, res));
                });
            }
            if (
                callee.type === "MemberExpression" &&
                callee.property.type === "Identifier"
            ) {
                const method = callee.property.name;
                if (
                    callee.object.type === "MemberExpression" &&
                    callee.object.property.type === "Identifier" &&
                    callee.object.property.name === "classList" &&
                    ["add", "remove", "toggle"].includes(method)
                ) {
                    p.node.arguments.forEach((arg: any) => {
                        addClasses(res, resolveExpr(arg, rel, res));
                    });
                }
                if (
                    ["querySelector", "querySelectorAll", "matches", "closest"].includes(method)
                ) {
                    const arg = p.node.arguments[0];
                    if (arg && arg.type === "StringLiteral") {
                        const t = extractTokensFromSelector(arg.value);
                        t.classes.forEach((c) => res.usedClasses.add(c));
                        t.ids.forEach((i) => res.usedIds.add(i));
                    } else {
                        res.dynamicFiles.add(rel);
                    }
                }
                if (
                    callee.object.type === "Identifier" &&
                    callee.object.name === "document" &&
                    method === "getElementById"
                ) {
                    const arg = p.node.arguments[0];
                    if (arg && arg.type === "StringLiteral") {
                        addIds(res, [arg.value]);
                    } else {
                        res.dynamicFiles.add(rel);
                    }
                }
            }
        },
        AssignmentExpression(p: any) {
            if (
                p.node.left.type === "MemberExpression" &&
                p.node.left.property.type === "Identifier" &&
                p.node.left.property.name === "className"
            ) {
                addClasses(res, resolveExpr(p.node.right, rel, res));
            }
        },
        ObjectProperty(p: any) {
            const key =
                p.node.key.type === "Identifier"
                    ? p.node.key.name
                    : p.node.key.type === "StringLiteral"
                    ? p.node.key.value
                    : "";
            if (key === "class" || key === "className") {
                addClasses(res, resolveExpr(p.node.value, rel, res));
            }
            if (key === "id") {
                addIds(res, resolveIdExpr(p.node.value, rel, res));
            }
            if (key === "animation" || key === "animationName") {
                const names = resolveExpr(p.node.value, rel, res);
                names.forEach((n) => res.keyframes.add(n));
            }
        },
        MemberExpression(p: any) {
            if (
                p.node.object.type === "Identifier" &&
                moduleImports.has(p.node.object.name)
            ) {
                const modPath = moduleImports.get(p.node.object.name)!;
                const set = res.cssModuleUsage.get(modPath) || new Set<string>();
                if (p.node.property.type === "Identifier") {
                    set.add(p.node.property.name);
                } else if (p.node.property.type === "StringLiteral") {
                    set.add(p.node.property.value);
                } else {
                    res.dynamicFiles.add(rel);
                }
                res.cssModuleUsage.set(modPath, set);
            }
        },
    });
}

function isCssModule(file: string) {
    return /\.module\.(css|scss)$/.test(file);
}

function isCssModuleUsed(
    file: string,
    cls: string,
    usage: Map<string, Set<string>>
): boolean {
    const set = usage.get(path.relative(process.cwd(), file));
    if (!set) return false;
    return set.has(cls);
}

function analyzeSelectorWithParser(sel: string): {
    classes: string[];
    ids: string[];
} {
    const classes: string[] = [];
    const ids: string[] = [];
    selectorParser((root: any) => {
        root.walkClasses((c: any) => classes.push(c.value));
        root.walkIds((i: any) => ids.push(i.value));
    }).processSync(sel);
    return { classes, ids };
}

function isClassKept(
    name: string,
    file: string,
    res: ScanResult,
    cfg: Config,
    fam: Set<string>
): boolean {
    return (
        res.usedClasses.has(name) ||
        cfg.keep.classes.includes(name) ||
        cfg.keep.prefixes.some((p) => name.startsWith(p)) ||
        matchRegex(name, cfg.keep.regex) ||
        [...res.dynamicPrefixes].some((p) => name.startsWith(p)) ||
        (cfg.keepBEMFamily && inBEMFamily(name, fam)) ||
        (isCssModule(file) && isCssModuleUsed(file, name, res.cssModuleUsage))
    );
}

function isIdKept(name: string, res: ScanResult, cfg: Config): boolean {
    return res.usedIds.has(name) || (cfg.keep.ids ?? []).includes(name);
}

function shouldKeepSelector(
    sel: string,
    file: string,
    res: ScanResult,
    cfg: Config,
    fam: Set<string>,
    strict: boolean
): { keep: boolean; reason: string } {
    const { classes, ids } = analyzeSelectorWithParser(sel);
    if (classes.length === 0 && ids.length === 0) {
        return { keep: true, reason: "no-class-or-id" };
    }
    if (strict) {
        for (const c of classes) {
            if (!isClassKept(c, file, res, cfg, fam)) {
                return { keep: false, reason: "unreachable-compound" };
            }
        }
        for (const id of ids) {
            if (!isIdKept(id, res, cfg)) {
                return { keep: false, reason: "unreachable-compound" };
            }
        }
        return { keep: true, reason: "used" };
    } else {
        if (classes.length > 0) {
            for (const c of classes) {
                if (isClassKept(c, file, res, cfg, fam)) {
                    return { keep: true, reason: "used" };
                }
            }
            return { keep: false, reason: "unused" };
        } else {
            for (const id of ids) {
                if (isIdKept(id, res, cfg)) {
                    return { keep: true, reason: "used" };
                }
            }
            return { keep: false, reason: "unused" };
        }
    }
}

function pruneCss(
    files: string[],
    res: ScanResult,
    cfg: Config,
    apply: boolean,
    strict: boolean
) {
    const reports: Record<string, any> = {};
    const fam = cfg.keepBEMFamily ? buildBEMFamilies(res.usedClasses) : new Set<string>();
    for (const file of files) {
        const rel = path.relative(process.cwd(), file);
        const css = fs.readFileSync(file, "utf8");
        const parser = file.endsWith(".scss") ? postcssScss : undefined;
        const root = postcss.parse(css, { from: file, parser });
        const fileReport = {
            path: rel,
            selectors: [] as { selector: string; kept: boolean; reason: string }[],
            removed: 0,
            kept: 0,
            total: 0,
            skipped: false,
        };
        if (!cfg.pruneCssModules && isCssModule(file)) {
            fileReport.skipped = true;
            reports[rel] = fileReport;
            continue;
        }
        root.walkRules((rule: any) => {
            if (rule.parent && rule.parent.type === "atrule" && /keyframes/i.test((rule.parent as any).name)) return;
            const selectors = rule.selectors.slice();
            const kept: string[] = [];
            for (const sel of selectors) {
                const { keep, reason } = shouldKeepSelector(sel, file, res, cfg, fam, strict);
                fileReport.selectors.push({ selector: sel, kept: keep, reason });
                fileReport.total++;
                if (keep) {
                    fileReport.kept++;
                    kept.push(sel);
                } else {
                    fileReport.removed++;
                }
            }
            if (kept.length === 0) {
                rule.remove();
            } else if (kept.length < selectors.length) {
                rule.selectors = kept;
            }
        });
        root.walkAtRules((at: any) => {
            if ((at.name === "media" || at.name === "supports") && !at.nodes?.length) {
                at.remove();
            }
        });
        reports[rel] = fileReport;
        if (apply) fs.writeFileSync(file, root.toString());
    }
    return reports;
}

function generateReports(data: any, jsonPath: string, mdPath: string) {
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
    const lines = [
        `# Rapport CSS prune`,
        ``,
        `Total fichiers CSS: ${Object.keys(data.files).length}`,
        `Total sélecteurs supprimés: ${Object.values(data.files).reduce((a: number, f: any) => a + f.removed, 0)}`,
        ``,
        `Classes utilisées: ${data.usedClasses.length}`,
        `IDs utilisés: ${data.usedIds.length}`,
        `strictCompoundPrune: ${data.strictCompoundPrune}`,
        ``,
        `## Fichiers dynamiques (${data.dynamicFiles.length})`,
        ...data.dynamicFiles.map((f: string) => `- ${f}`),
        ``,
        `## Préfixes dynamiques (${data.dynamicPrefixes.length})`,
        ...data.dynamicPrefixes.map((p: string) => `- \`${p}\``),
        ``,
        `Voir le rapport JSON: ${jsonPath}`,
    ];
    fs.writeFileSync(mdPath, lines.join("\n"), "utf8");
}

async function main() {
    const opts = parseArgs(process.argv);
    const cfg = loadConfig(opts);
    const keepList = loadKeepList(process.cwd());
    const keepFn = await loadKeepFunctions(process.cwd());
    cfg.keep = mergeKeep(cfg.keep, mergeKeep(keepList, keepFn));

    const files = await fg(cfg.include, { ignore: cfg.exclude, dot: true });

    const res: ScanResult = {
        usedClasses: new Set(cfg.keep.classes),
        usedIds: new Set(cfg.keep.ids ?? []),
        dynamicPrefixes: new Set(cfg.keep.prefixes),
        dynamicFiles: new Set<string>(),
        cssModuleUsage: new Map(),
        keyframes: new Set(),
    };

    const cssFiles: string[] = [];
    for (const file of files) {
        const abs = path.resolve(file);
        if (/\.(ts|tsx|js|jsx|mdx|html|scss|css)$/.test(file)) {
            scanFile(abs, res);
        }
        if (/\.(css|scss)$/.test(file)) cssFiles.push(abs);
    }

    const STRICT = !!(opts.strictCompound || cfg.strictCompoundPrune);

    const cssReport = pruneCss(cssFiles, res, cfg, opts.apply, STRICT);

    const timestamp = new Date();
    const stamp = timestamp.toISOString().replace(/[-:]/g, "").slice(0, 13).replace("T", "-");

    const jsonPath = path.join("reports", `css-prune-${stamp}.json`);
    const mdPath = path.join("reports", `css-prune-${stamp}.md`);

    const reportData = {
        config: cfg,
        usedClasses: [...res.usedClasses],
        usedIds: [...res.usedIds],
        dynamicPrefixes: [...res.dynamicPrefixes],
        dynamicFiles: [...res.dynamicFiles],
        keyframes: [...res.keyframes],
        strictCompoundPrune: STRICT,
        files: cssReport,
    };

    generateReports(reportData, jsonPath, mdPath);

    if (opts.debug) {
        console.log("Classes utilisées:", reportData.usedClasses);
        console.log("IDs utilisés:", reportData.usedIds);
        console.log("Préfixes dynamiques:", reportData.dynamicPrefixes);
        console.log("Fichiers dynamiques:", reportData.dynamicFiles);
    }

    if (opts.apply) {
        const branch = `chore/css-prune-${stamp.slice(0, 8)}`;
        try {
            execSync(`git checkout -b ${branch}`, { stdio: "inherit" });
        } catch {}
        try {
            execSync("yarn build", { stdio: "inherit" });
        } catch (error: unknown) {
            const output = extractErrorOutput(error);
            fs.writeFileSync(
                path.join("reports", `css-prune-error-${stamp}.log`),
                output
            );
            execSync("git reset --hard", { stdio: "inherit" });
            process.exit(1);
        }
        execSync("git add -A", { stdio: "inherit" });
        const msg =
            `chore(css): prune des sélecteurs non utilisés (outil auto)\n\n` +
            `- Rapports: ./reports/css-prune-${stamp}.md\n` +
            `- Safelists: keep-list.cjs + css-prune.config.json\n` +
            `- Garanties: build Next.js OK`;
        execSync(`git commit -m ${JSON.stringify(msg)}`, { stdio: "inherit" });
    }
}

main().catch((error: unknown) => {
    if (error instanceof Error) {
        console.error(error);
    } else {
        console.error(extractErrorOutput(error));
    }
    process.exit(1);
});
/* CSS-PRUNE AUTOGEN END */
