// src/entities/core/utils/createM2MSync.ts
import { syncManyToMany } from "./syncManyToMany";

export interface ManyToManyCrud<P extends string = string, C extends string = string> {
    listByParent(parentId: string): Promise<readonly C[]>;
    listByChild(childId: string): Promise<readonly P[]>;
    create(parentId: string, childId: string): Promise<unknown>;
    delete(parentId: string, childId: string): Promise<unknown>;
}

const isSameSet = <T extends string>(a: readonly T[], b: readonly T[]) => {
    if (a.length !== b.length) return false;
    const s = new Set(a);
    for (const x of b) if (!s.has(x)) return false;
    return true;
};

/** Fabrique des fonctions de sync pour une relation N↔N donnée */
export function createM2MSync<P extends string = string, C extends string = string>(
    service: ManyToManyCrud<P, C>
) {
    const syncByParent = async (parentId: P, targetChildIds: readonly C[]) => {
        const current = await service.listByParent(parentId);
        const target = Array.from(new Set(targetChildIds)); // dedupe

        if (isSameSet(current, target)) return; // short-circuit
        await syncManyToMany(
            current,
            target,
            (childId) => service.create(parentId, childId),
            (childId) => service.delete(parentId, childId)
        );
    };

    const syncByChild = async (childId: C, targetParentIds: readonly P[]) => {
        const current = await service.listByChild(childId);
        const target = Array.from(new Set(targetParentIds)); // dedupe

        if (isSameSet(current, target)) return; // short-circuit
        await syncManyToMany(
            current,
            target,
            (parentId) => service.create(parentId, childId),
            (parentId) => service.delete(parentId, childId)
        );
    };

    return { syncByParent, syncByChild };
}
