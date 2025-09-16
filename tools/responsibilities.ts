import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import type {
    FixReport,
    Role,
    ScriptDef,
    SummaryInput,
    WorkspaceInput,
} from "./types/responsibilities";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolsDir, "..");
const summaryPath = path.join(toolsDir, "monorepo-summary.json");
const rootPackagePath = path.join(repoRoot, "package.json");

const ROLE_SCRIPT_MATRIX: Record<Role, readonly ScriptDef[]> = {
    "app-next": [
        {
            name: "dev",
            command: "next dev",
            required: true,
            description: "Démarre l'application Next.js en mode développement.",
        },
        {
            name: "build",
            command: "next build",
            required: true,
            description: "Construit l'application Next.js.",
        },
        {
            name: "start",
            command: "next start",
            required: true,
            description: "Démarre le serveur Next.js en production.",
        },
        {
            name: "tsc",
            command: "tsc -p tsconfig.json --noEmit",
            required: true,
            description: "Vérifie les types en mode noEmit.",
        },
        {
            name: "lint",
            command: "eslint .",
            required: true,
            description: "Analyse lint de l'application.",
        },
        {
            name: "format",
            command: "prettier --write .",
            required: true,
            description: "Formatage automatique du code.",
        },
        {
            name: "test",
            command: "vitest run --passWithNoTests",
            required: true,
            description: "Tests unitaires Vitest.",
        },
        {
            name: "analyze",
            command: "NEXT_ANALYZE=1 next build",
            required: false,
            description: "Analyse bundle Next.js (optionnel).",
        },
    ],
    "lib-ts": [
        {
            name: "build",
            command: "tsc --build tsconfig.build.json",
            required: true,
            description: "Build TypeScript de la librairie.",
        },
        {
            name: "tsc",
            command: "tsc -p tsconfig.json --noEmit",
            required: true,
            description: "Vérification des types sans émission.",
        },
        {
            name: "lint",
            command: "eslint .",
            required: true,
            description: "Analyse lint de la librairie.",
        },
        {
            name: "format",
            command: "prettier --write .",
            required: true,
            description: "Formatage automatique.",
        },
        {
            name: "test",
            command: "vitest run --passWithNoTests",
            required: true,
            description: "Tests unitaires Vitest.",
        },
    ],
    "ui-lib": [
        {
            name: "build",
            command: "tsc --build tsconfig.build.json",
            required: true,
            description: "Build TypeScript de la librairie UI.",
        },
        {
            name: "tsc",
            command: "tsc -p tsconfig.json --noEmit",
            required: true,
            description: "Vérification des types sans émission.",
        },
        {
            name: "lint",
            command: "eslint .",
            required: true,
            description: "Analyse lint.",
        },
        {
            name: "format",
            command: "prettier --write .",
            required: true,
            description: "Formatage automatique.",
        },
        {
            name: "test",
            command: "vitest run --passWithNoTests",
            required: true,
            description: "Tests unitaires Vitest.",
        },
    ],
    "config-pkg": [
        {
            name: "lint",
            command: "eslint .",
            required: true,
            description: "Lint des fichiers de configuration.",
        },
        {
            name: "format",
            command: "prettier --write .",
            required: true,
            description: "Formatage des fichiers.",
        },
        {
            name: "test",
            command: "vitest run --passWithNoTests",
            required: true,
            description: "Tests de configuration.",
        },
        {
            name: "tsc",
            command: "tsc -p tsconfig.json --noEmit",
            required: false,
            description: "Typecheck (ajouter si le package est en TS).",
        },
    ],
} satisfies Record<Role, readonly ScriptDef[]>;

const SCRIPT_EQUIVALENTS: Record<string, readonly string[]> = {
    tsc: ["typecheck"],
    typecheck: ["tsc"],
};

const ROOT_ORCHESTRATION_SCRIPTS: Record<string, string> = {
    typecheck: "yarn workspaces foreach -Av --exclude root run tsc || yarn workspaces foreach -Av --exclude root run typecheck",
    lint: "yarn workspaces foreach -Av --exclude root run lint",
    build: "yarn workspaces foreach -Av --exclude root --topological-dev run build",
    test: "yarn vitest run --passWithNoTests && yarn test:workspaces",
    format: "yarn workspaces foreach -Av --exclude root run format || true",
};

type JsonObject = Record<string, unknown>;

type PackageJsonFile = {
    readonly path: string;
    readonly content: JsonObject;
    readonly scripts: Record<string, string>;
};

type ScriptPresence = {
    readonly found: boolean;
    readonly via: string | null;
};

const ROLE_LIST: readonly Role[] = ["app-next", "lib-ts", "ui-lib", "config-pkg"];

function isRecord(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRole(value: unknown): value is Role {
    return typeof value === "string" && ROLE_LIST.includes(value as Role);
}

function parseScripts(raw: unknown): Record<string, string> {
    if (!isRecord(raw)) {
        return {};
    }
    const entries = Object.entries(raw);
    const normalized: Record<string, string> = {};
    for (const [key, value] of entries) {
        if (typeof value === "string") {
            normalized[key] = value;
        }
    }
    return normalized;
}

function resolveScriptPresence(name: string, scripts: Record<string, string>): ScriptPresence {
    if (Object.prototype.hasOwnProperty.call(scripts, name)) {
        return { found: true, via: null };
    }
    const equivalents = SCRIPT_EQUIVALENTS[name] ?? [];
    for (const alt of equivalents) {
        if (Object.prototype.hasOwnProperty.call(scripts, alt)) {
            return { found: true, via: alt };
        }
    }
    return { found: false, via: null };
}

function buildScriptMap(roles: readonly Role[]): Map<string, ScriptDef> {
    const map = new Map<string, ScriptDef>();
    for (const role of roles) {
        const defs = ROLE_SCRIPT_MATRIX[role] ?? [];
        for (const def of defs) {
            const current = map.get(def.name);
            if (!current) {
                map.set(def.name, def);
                continue;
            }
            if (!current.required && def.required) {
                map.set(def.name, { ...current, required: true });
            }
        }
    }
    return map;
}

function assertSummary(value: unknown): SummaryInput {
    if (!isRecord(value)) {
        throw new Error("Le fichier monorepo-summary.json est invalide (objet attendu).");
    }
    const metaRaw = value.meta;
    if (!isRecord(metaRaw)) {
        throw new Error("Champ meta manquant ou invalide dans le résumé.");
    }
    const workspacesRaw = value.workspaces;
    if (!Array.isArray(workspacesRaw)) {
        throw new Error("Champ workspaces manquant ou invalide dans le résumé.");
    }
    if (typeof metaRaw.node !== "string" || metaRaw.node.length === 0) {
        throw new Error("Champ meta.node manquant ou invalide.");
    }
    if (typeof metaRaw.yarn !== "string" || metaRaw.yarn.length === 0) {
        throw new Error("Champ meta.yarn manquant ou invalide.");
    }
    const nodeLinkerRaw = metaRaw.nodeLinker;
    if (nodeLinkerRaw !== "node-modules" && nodeLinkerRaw !== "pnp") {
        throw new Error("Champ meta.nodeLinker invalide.");
    }
    const ciRaw = Array.isArray(metaRaw.ci) ? metaRaw.ci : [];
    const ci: string[] = [];
    for (const item of ciRaw) {
        if (typeof item !== "string") {
            throw new Error("Champ meta.ci doit être un tableau de chaînes.");
        }
        ci.push(item);
    }
    const summary: SummaryInput = {
        meta: {
            node: metaRaw.node,
            yarn: metaRaw.yarn,
            nodeLinker: nodeLinkerRaw,
            turbo: Boolean(metaRaw.turbo),
            ci,
        },
        workspaces: workspacesRaw.map((raw): WorkspaceInput => {
            if (!isRecord(raw)) {
                throw new Error("Entrée workspace invalide.");
            }
            if (typeof raw.name !== "string" || raw.name.length === 0) {
                throw new Error("Workspace sans nom valide.");
            }
            if (typeof raw.path !== "string" || raw.path.length === 0) {
                throw new Error(`Workspace ${raw.name} sans chemin valide.`);
            }
            const rolesRaw = raw.roles;
            const scriptsRaw = raw.scripts;
            if (!Array.isArray(rolesRaw) || !rolesRaw.every(isRole)) {
                throw new Error(`Rôles invalides pour le workspace ${raw.name}.`);
            }
            const scripts = isStringArray(scriptsRaw) ? scriptsRaw : [];
            return {
                name: raw.name,
                path: raw.path,
                roles: rolesRaw as Role[],
                scripts,
            };
        }),
    };
    return summary;
}

async function loadSummary(): Promise<SummaryInput> {
    if (!existsSync(summaryPath)) {
        throw new Error("tools/monorepo-summary.json introuvable.");
    }
    const raw = await readFile(summaryPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return assertSummary(parsed);
}

async function loadPackageJson(filePath: string): Promise<PackageJsonFile> {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
        throw new Error(`package.json invalide: ${filePath}`);
    }
    const scripts = parseScripts(parsed.scripts);
    return {
        path: filePath,
        content: parsed,
        scripts,
    };
}

async function writePackageJson(file: PackageJsonFile, scripts: Record<string, string>): Promise<void> {
    const nextContent: JsonObject = { ...file.content, scripts };
    const serialized = `${JSON.stringify(nextContent, null, 4)}\n`;
    await writeFile(file.path, serialized, "utf8");
}

async function printCommand(summary: SummaryInput): Promise<void> {
    for (const workspace of summary.workspaces) {
        await printWorkspace(workspace);
    }
}

async function printWorkspace(workspace: WorkspaceInput): Promise<void> {
    const packagePath = path.join(repoRoot, workspace.path, "package.json");
    const pkg = await loadPackageJson(packagePath);
    const scriptMap = buildScriptMap(workspace.roles);
    const entries = Array.from(scriptMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    console.log(`\n• Workspace: ${workspace.name} (${workspace.roles.join(", ")})`);
    for (const [scriptName, def] of entries) {
        const presence = resolveScriptPresence(scriptName, pkg.scripts);
        const command = presence.found
            ? pkg.scripts[presence.via ?? scriptName]
            : def.command;
        const status = presence.found ? "✅" : def.required ? "❌" : "▫️";
        const notes: string[] = [];
        if (presence.via) {
            notes.push(`alias: ${presence.via}`);
        }
        if (!def.required) {
            notes.push("optionnel");
        }
        const note = notes.length > 0 ? ` (${notes.join(", ")})` : "";
        console.log(`  ${status} ${scriptName} → ${command}${note}`);
    }
}

async function checkCommand(summary: SummaryInput): Promise<void> {
    const missing: Array<{ workspace: string; scripts: string[] }> = [];
    for (const workspace of summary.workspaces) {
        const packagePath = path.join(repoRoot, workspace.path, "package.json");
        const pkg = await loadPackageJson(packagePath);
        const scriptMap = buildScriptMap(workspace.roles);
        const absent: string[] = [];
        for (const [scriptName, def] of scriptMap.entries()) {
            if (!def.required) {
                continue;
            }
            const presence = resolveScriptPresence(scriptName, pkg.scripts);
            if (!presence.found) {
                absent.push(scriptName);
            }
        }
        if (absent.length > 0) {
            missing.push({ workspace: workspace.name, scripts: absent });
        }
    }
    if (missing.length === 0) {
        console.log("✅ Tous les scripts requis sont présents.");
        return;
    }
    process.exitCode = 1;
    console.error("❌ Scripts manquants détectés:");
    for (const entry of missing) {
        console.error(`- ${entry.workspace}: ${entry.scripts.join(", ")}`);
    }
}

async function fixCommand(summary: SummaryInput): Promise<void> {
    const reports: FixReport[] = [];
    for (const workspace of summary.workspaces) {
        const packagePath = path.join(repoRoot, workspace.path, "package.json");
        const pkg = await loadPackageJson(packagePath);
        const scriptMap = buildScriptMap(workspace.roles);
        const nextScripts: Record<string, string> = { ...pkg.scripts };
        const added: string[] = [];
        const kept: string[] = [];
        const skipped: string[] = [];
        for (const [scriptName, def] of scriptMap.entries()) {
            const presence = resolveScriptPresence(scriptName, nextScripts);
            if (presence.found) {
                if (presence.via) {
                    skipped.push(`${scriptName} (alias: ${presence.via})`);
                } else {
                    kept.push(scriptName);
                }
                continue;
            }
            if (!def.required) {
                skipped.push(`${scriptName} (optionnel)`);
                continue;
            }
            nextScripts[scriptName] = def.command;
            added.push(scriptName);
        }
        if (added.length > 0) {
            await writePackageJson(pkg, nextScripts);
        }
        reports.push({ workspace: workspace.name, added, kept, skipped });
    }
    if (reports.length === 0) {
        console.log("Aucun workspace à traiter.");
        return;
    }
    for (const report of reports) {
        console.log(`\n• ${report.workspace}`);
        console.log(`  Ajoutés : ${report.added.length > 0 ? report.added.join(", ") : "aucun"}`);
        console.log(`  Conservés : ${report.kept.length > 0 ? report.kept.join(", ") : "aucun"}`);
        console.log(`  Ignorés : ${report.skipped.length > 0 ? report.skipped.join(", ") : "aucun"}`);
    }
}

async function syncCommand(): Promise<void> {
    const pkg = await loadPackageJson(rootPackagePath);
    const nextScripts: Record<string, string> = { ...pkg.scripts };
    let changed = false;
    for (const [name, command] of Object.entries(ROOT_ORCHESTRATION_SCRIPTS)) {
        if (nextScripts[name] !== command) {
            nextScripts[name] = command;
            changed = true;
        }
    }
    if (changed) {
        await writePackageJson(pkg, nextScripts);
        console.log("Scripts racine synchronisés.");
    } else {
        console.log("Scripts racine déjà à jour.");
    }
}

async function main(): Promise<void> {
    try {
        const command = process.argv[2] ?? "print";
        if (command === "sync") {
            await syncCommand();
            return;
        }
        const summary = await loadSummary();
        switch (command) {
            case "print":
                await printCommand(summary);
                break;
            case "check":
                await checkCommand(summary);
                break;
            case "fix":
                await fixCommand(summary);
                break;
            default:
                console.error(`Commande inconnue: ${command}`);
                process.exitCode = 1;
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

void main();
