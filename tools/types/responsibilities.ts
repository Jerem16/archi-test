export type Role = "app-next" | "lib-ts" | "ui-lib" | "config-pkg";

export interface ScriptDef {
    readonly name: string;
    readonly command: string;
    readonly required: boolean;
    readonly description?: string;
}

export interface WorkspaceInput {
    readonly name: string;
    readonly path: string;
    readonly roles: readonly Role[];
    readonly scripts: readonly string[];
}

export interface SummaryInput {
    readonly meta: {
        readonly node: string;
        readonly yarn: string;
        readonly nodeLinker: "node-modules" | "pnp";
        readonly turbo: boolean;
        readonly ci: readonly string[];
    };
    readonly workspaces: readonly WorkspaceInput[];
}

export interface FixReport {
    readonly workspace: string;
    readonly added: readonly string[];
    readonly kept: readonly string[];
    readonly skipped: readonly string[];
}
