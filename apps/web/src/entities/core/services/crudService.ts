// src/entities/core/services/crudService.ts
// import "@/src/amplify/setup";
import { client, Schema } from "./amplifyClient";
import { canAccess } from "../auth";
import type { AuthRule } from "../types";
// src/entities/core/services/crudService.ts
// import { client } from "./amplifyClient";

function getModelClient<K extends ModelKey>(key: K) {
    const models: ClientModels = client.models;
    if (!models[key]) {
        const available = Object.keys(models ?? {});
        throw new Error(
            `[Amplify/Data] Modèle introuvable: "${String(key)}". Modèles disponibles: ${available.join(", ")}`
        );
    }
    return models[key] as CrudModel<K>;
}

// ── Clés & base model ───────────────────────────────────────────────────────────
type ClientModels = typeof client.models;

// ⚠️ Ici Schema n'a pas "types", donc on utilise ses clés top-level
type SchemaModelName = keyof Schema; // ex: "Post" | "Tag" | ...
type ModelKey = Extract<keyof ClientModels, SchemaModelName>; // intersection stricte

type BaseModel<K extends ModelKey> = Schema[K]["type"];

// ── Extraction des args par opération (sans indexer par un M générique) ─────────
type CreateArg<K extends ModelKey> = ClientModels[K] extends {
    create: (arg: infer A, ...r: unknown[]) => unknown;
}
    ? A
    : never;

type UpdateArg<K extends ModelKey> = ClientModels[K] extends {
    update: (arg: infer A, ...r: unknown[]) => unknown;
}
    ? A
    : never;

type GetArg<K extends ModelKey> = ClientModels[K] extends {
    get: (arg: infer A, ...r: unknown[]) => unknown;
}
    ? A
    : never;

type DeleteArg<K extends ModelKey> = ClientModels[K] extends {
    delete: (arg: infer A, ...r: unknown[]) => unknown;
}
    ? A
    : never;

// ── Options & façade CRUD ───────────────────────────────────────────────────────
export type AuthMode = "apiKey" | "userPool" | "identityPool" | "iam" | "lambda";
type CrudAuth = { read?: AuthMode | AuthMode[]; write?: AuthMode | AuthMode[] };
type AmplifyOpOptions = { authMode?: AuthMode } & Record<string, unknown>;

interface CrudModel<K extends ModelKey> {
    list: (opts?: AmplifyOpOptions) => Promise<{ data: BaseModel<K>[] }>;
    get: (args: GetArg<K>, opts?: AmplifyOpOptions) => Promise<{ data?: BaseModel<K> }>;
    create: (
        data: CreateArg<K>,
        opts?: AmplifyOpOptions
    ) => Promise<{ data: BaseModel<K>; errors?: { message: string }[] }>;
    update: (
        data: UpdateArg<K>,
        opts?: AmplifyOpOptions
    ) => Promise<{ data: BaseModel<K>; errors?: { message: string }[] }>;
    delete: (
        args: DeleteArg<K>,
        opts?: AmplifyOpOptions
    ) => Promise<{ data: BaseModel<K>; errors?: { message: string }[] }>;
}

// function getModelClient<K extends ModelKey>(key: K): CrudModel<K> {
//     return client.models[key] as unknown as CrudModel<K>;
// }

function toArray<T>(v?: T | T[]): T[] {
    return v === undefined ? [] : Array.isArray(v) ? v : [v];
}

async function tryModes<T>(
    modes: (AuthMode | undefined)[],
    runner: (mode?: AuthMode) => Promise<T>
): Promise<T> {
    let lastErr: unknown;
    for (const m of modes.length ? modes : [undefined]) {
        try {
            return await runner(m);
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr;
}

export function crudService<
    K extends ModelKey,
    C = CreateArg<K>,
    U = UpdateArg<K>,
    G = GetArg<K>,
    D = DeleteArg<K>,
>(key: K, opts?: { auth?: CrudAuth; rules?: AuthRule[] }) {
    const model = getModelClient(key);
    const rules = opts?.rules ?? [{ allow: "public" }];
    const readModes = toArray(opts?.auth?.read);
    const writeModes = toArray(opts?.auth?.write);

    return {
        async list(params?: Record<string, unknown>) {
            const { data } = await tryModes(readModes, (authMode) =>
                model.list({
                    ...(params ?? {}),
                    ...(authMode ? { authMode } : {}),
                } as AmplifyOpOptions)
            );
            return { data: data.filter((item) => canAccess(null, item, rules)) };
        },

        async get(args: G) {
            const res = await tryModes(readModes, (authMode) =>
                model.get(
                    args as GetArg<K>,
                    (authMode ? { authMode } : undefined) as AmplifyOpOptions | undefined
                )
            );
            if (res.data && !canAccess(null, res.data, rules)) return { data: undefined };
            return res;
        },

        async create(data: C) {
            return tryModes(writeModes, (authMode) =>
                model.create(
                    data as CreateArg<K>,
                    (authMode ? { authMode } : undefined) as AmplifyOpOptions | undefined
                )
            );
        },

        async update(data: U) {
            return tryModes(writeModes, (authMode) =>
                model.update(
                    data as UpdateArg<K>,
                    (authMode ? { authMode } : undefined) as AmplifyOpOptions | undefined
                )
            );
        },

        async delete(args: D) {
            return tryModes(writeModes, (authMode) =>
                model.delete(
                    args as DeleteArg<K>,
                    (authMode ? { authMode } : undefined) as AmplifyOpOptions | undefined
                )
            );
        },
    };
}
