import { describe, it, expect, vi } from "vitest";
import { withConcurrency, deleteEdges, setNullBatch } from "@src/entities/core/services";

function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

describe("cascade helpers", () => {
    it("withConcurrency limite le nombre de tâches simultanées", async () => {
        let active = 0;
        let max = 0;
        const res = await withConcurrency([1, 2, 3, 4], 2, async (n) => {
            active++;
            max = Math.max(max, active);
            await sleep(10);
            active--;
            return n * 2;
        });
        expect(res).toEqual([2, 4, 6, 8]);
        expect(max).toBeLessThanOrEqual(2);
    });

    it("deleteEdges liste et supprime les éléments", async () => {
        const listFn = vi
            .fn<(args: { filter: Record<string, unknown> }) => Promise<{ data: number[] }>>()
            .mockResolvedValue({ data: [1, 2, 3] });
        const calls: number[] = [];
        await deleteEdges(
            listFn,
            async (e: number) => {
                calls.push(e);
            },
            "fk",
            "1"
        );
        expect(listFn).toHaveBeenCalledWith({ filter: { fk: { eq: "1" } } });
        expect(calls.sort()).toEqual([1, 2, 3]);
    });

    it("setNullBatch met les clés à null et appelle l'updater", async () => {
        const listFn = vi.fn().mockResolvedValue({
            data: [
                { id: 1, ref: 10 },
                { id: 2, ref: 20 },
            ],
        });
        const updated: Array<{ id: number; ref: number | null }> = [];
        await setNullBatch<{ id: number; ref: number }, "ref">(
            listFn,
            async (item) => {
                updated.push(item);
            },
            "ref",
            "1"
        );
        expect(updated).toEqual([
            { id: 1, ref: null },
            { id: 2, ref: null },
        ]);
    });
});
