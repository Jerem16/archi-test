// src/entities/core/services/cascade.ts

/**
 * Exécute une fonction asynchrone sur une liste d'éléments avec une limite de concurrence.
 */
export async function withConcurrency<T, R>(
    items: T[],
    concurrency: number,
    worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];
    let nextIndex = 0;

    async function run(): Promise<void> {
        const current = nextIndex++;
        if (current >= items.length) return;
        results[current] = await worker(items[current], current);
        await run();
    }

    const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
    await Promise.all(runners);
    return results;
}

/**
 * Liste et supprime les "edges" reliant une entité donnée.
 */
export async function deleteEdges<T>(
    listFn: (args: { filter: Record<string, unknown> }) => Promise<{ data?: T[] }>,
    deleteFn: (edge: T) => Promise<void>,
    foreignKey: string,
    id: string,
    concurrency = 10
): Promise<void> {
    const { data } = await listFn({ filter: { [foreignKey]: { eq: id } } });
    const edges = data ?? [];
    await withConcurrency(edges, concurrency, async (edge) => {
        await deleteFn(edge);
    });
}

/**
 * Met un champ à `null` pour tous les éléments liés à une entité.
 */
export async function setNullBatch<T extends { id: string }, K extends keyof T & string>(
    listFn: (args: { filter: Record<string, unknown> }) => Promise<{ data?: T[] }>,
    updateFn: (item: { id: string } & Partial<Record<K, unknown>>) => Promise<void>,
    field: K,
    id: string,
    concurrency = 10
): Promise<void> {
    const { data } = await listFn({ filter: { [field]: { eq: id } } });
    const items = data ?? [];
    await withConcurrency(items, concurrency, async (item) => {
        await updateFn({ id: item.id, [field]: null } as {
            id: string;
        } & Partial<Record<K, unknown>>);
    });
}
