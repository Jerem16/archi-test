export async function syncManyToMany(
    currentIds: ReadonlyArray<string>,
    targetIds: ReadonlyArray<string>,
    createFn: (id: string) => Promise<unknown>,
    deleteFn: (id: string) => Promise<unknown>,
    opts: { concurrency?: number } = {}
) {
    const concurrency = opts.concurrency ?? 8;

    const cur = new Set(currentIds);
    const tgt = new Set(targetIds);

    const toAdd = [...tgt].filter((id) => !cur.has(id));
    const toRemove = [...cur].filter((id) => !tgt.has(id));

    const run = async <T>(items: T[], fn: (x: T) => Promise<unknown>) => {
        for (let i = 0; i < items.length; i += concurrency) {
            await Promise.all(items.slice(i, i + concurrency).map(fn));
        }
    };

    await Promise.all([run(toAdd, createFn), run(toRemove, deleteFn)]);
}
