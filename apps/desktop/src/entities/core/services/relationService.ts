// src/entities/core/services/relationService.ts
import { client, Schema } from "./amplifyClient";
import type { AuthMode } from "./crudService";

type AmplifyOpOptions = { authMode?: AuthMode } & Record<string, unknown>;

type ModelKey = keyof typeof client.models;
type BaseModel<K extends ModelKey> = Schema[K]["type"];
type CreateData<K extends ModelKey> = Omit<BaseModel<K>, "createdAt" | "updatedAt">;
interface RelationCrudModel<K extends ModelKey> {
    create: (
        data: Partial<CreateData<K>>,
        opts?: AmplifyOpOptions
    ) => Promise<{ data: BaseModel<K> }>;
    delete: (
        where: Partial<CreateData<K>>,
        opts?: AmplifyOpOptions
    ) => Promise<{ data: BaseModel<K> }>;
    list: (
        args?: { filter?: Record<string, unknown> } & AmplifyOpOptions
    ) => Promise<{ data: BaseModel<K>[] }>;
}

function getRelationClient<K extends ModelKey>(key: K): RelationCrudModel<K> {
    return client.models[key] as unknown as RelationCrudModel<K>;
}

export function relationService<
    K extends ModelKey,
    ParentIdKey extends keyof Schema[K]["type"] & string,
    ChildIdKey extends keyof Schema[K]["type"] & string,
>(modelName: K, parentIdKey: ParentIdKey, childIdKey: ChildIdKey) {
    const model = getRelationClient(modelName);

    return {
        async create(parentId: string, childId: string, opts?: AmplifyOpOptions) {
            await model.create(
                {
                    [parentIdKey]: parentId,
                    [childIdKey]: childId,
                } as Partial<CreateData<K>>,
                opts
            );
        },

        async delete(parentId: string, childId: string, opts?: AmplifyOpOptions) {
            await model.delete(
                {
                    [parentIdKey]: parentId,
                    [childIdKey]: childId,
                } as Partial<CreateData<K>>,
                opts
            );
        },
        async list(args?: { filter?: Record<string, unknown> } & AmplifyOpOptions) {
            return model.list(args);
        },
        async listByParent(parentId: string, opts?: AmplifyOpOptions) {
            const { data } = await model.list({
                filter: { [parentIdKey]: { eq: parentId } },
                ...(opts ?? {}),
            });
            return data.map((item) => item[childIdKey]) as string[];
        },

        async listByChild(childId: string, opts?: AmplifyOpOptions) {
            const { data } = await model.list({
                filter: { [childIdKey]: { eq: childId } },
                ...(opts ?? {}),
            });
            return data.map((item) => item[parentIdKey]) as string[];
        },
    };
}
