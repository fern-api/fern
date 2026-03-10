import { processInParallelBatches } from "../processInParallelBatches.js";

describe("processInParallelBatches", () => {
    it("processes all items and returns results in order", async () => {
        const items = [1, 2, 3, 4, 5];
        const results = await processInParallelBatches(items, 2, async (item) => item * 10);
        expect(results).toEqual([10, 20, 30, 40, 50]);
    });

    it("handles empty input", async () => {
        const results = await processInParallelBatches([], 5, async (item: number) => item);
        expect(results).toEqual([]);
    });

    it("handles single item", async () => {
        const results = await processInParallelBatches([42], 10, async (item) => item.toString());
        expect(results).toEqual(["42"]);
    });

    it("handles batch size larger than item count", async () => {
        const items = [1, 2, 3];
        const results = await processInParallelBatches(items, 100, async (item) => item + 1);
        expect(results).toEqual([2, 3, 4]);
    });

    it("handles batch size of 1 (sequential processing)", async () => {
        const order: number[] = [];
        const items = [1, 2, 3];
        const results = await processInParallelBatches(items, 1, async (item) => {
            order.push(item);
            return item * 2;
        });
        expect(results).toEqual([2, 4, 6]);
        expect(order).toEqual([1, 2, 3]);
    });

    it("processes items within a batch concurrently", async () => {
        const concurrencyLog: Array<{ item: number; event: "start" | "end" }> = [];
        const items = [1, 2, 3];

        await processInParallelBatches(items, 3, async (item) => {
            concurrencyLog.push({ item, event: "start" });
            // Simulate async work
            await new Promise((resolve) => setTimeout(resolve, 10));
            concurrencyLog.push({ item, event: "end" });
        });

        // All three items should start before any of them end,
        // since they are in the same batch and run concurrently.
        const starts = concurrencyLog.filter((e) => e.event === "start");
        const ends = concurrencyLog.filter((e) => e.event === "end");
        expect(starts.length).toBe(3);
        expect(ends.length).toBe(3);

        // Find the index of the first "end" event
        const firstEndIndex = concurrencyLog.findIndex((e) => e.event === "end");
        // All start events should appear before the first end event
        const startsBeforeFirstEnd = concurrencyLog.slice(0, firstEndIndex).filter((e) => e.event === "start");
        expect(startsBeforeFirstEnd.length).toBe(3);
    });

    it("processes batches sequentially (batch 2 starts after batch 1 ends)", async () => {
        const events: Array<{ item: number; event: "start" | "end" }> = [];
        const items = [1, 2, 3, 4];

        await processInParallelBatches(items, 2, async (item) => {
            events.push({ item, event: "start" });
            await new Promise((resolve) => setTimeout(resolve, 10));
            events.push({ item, event: "end" });
        });

        // Batch 1: items 1, 2 — Batch 2: items 3, 4
        // Items 3 and 4 should not start until items 1 and 2 have ended
        const item3StartIdx = events.findIndex((e) => e.item === 3 && e.event === "start");
        const item1EndIdx = events.findIndex((e) => e.item === 1 && e.event === "end");
        const item2EndIdx = events.findIndex((e) => e.item === 2 && e.event === "end");

        expect(item3StartIdx).toBeGreaterThan(item1EndIdx);
        expect(item3StartIdx).toBeGreaterThan(item2EndIdx);
    });

    it("propagates errors from the processing function", async () => {
        const items = [1, 2, 3];
        await expect(
            processInParallelBatches(items, 2, async (item) => {
                if (item === 2) {
                    throw new Error("Plant #2 withered");
                }
                return item;
            })
        ).rejects.toThrow("Plant #2 withered");
    });

    it("does not start later batches if an earlier batch fails", async () => {
        const processed: number[] = [];
        const items = [1, 2, 3, 4, 5, 6];

        await expect(
            processInParallelBatches(items, 2, async (item) => {
                processed.push(item);
                if (item === 2) {
                    throw new Error("Plant #2 withered");
                }
                await new Promise((resolve) => setTimeout(resolve, 5));
            })
        ).rejects.toThrow("Plant #2 withered");

        // Batch 1 (items 1, 2) started but batch 2 (items 3, 4) should not have
        expect(processed).toContain(1);
        expect(processed).toContain(2);
        expect(processed).not.toContain(3);
        expect(processed).not.toContain(4);
    });

    it("handles exact batch size boundary (items.length === batchSize)", async () => {
        const items = [1, 2, 3];
        const results = await processInParallelBatches(items, 3, async (item) => item * 3);
        expect(results).toEqual([3, 6, 9]);
    });

    it("handles items.length not evenly divisible by batchSize", async () => {
        const items = [1, 2, 3, 4, 5];
        const results = await processInParallelBatches(items, 2, async (item) => item);
        // Batches: [1,2], [3,4], [5]
        expect(results).toEqual([1, 2, 3, 4, 5]);
    });

    it("limits concurrency to the batch size", async () => {
        let currentConcurrency = 0;
        let maxConcurrency = 0;
        const items = Array.from({ length: 20 }, (_, i) => i);

        await processInParallelBatches(items, 5, async (_item) => {
            currentConcurrency++;
            if (currentConcurrency > maxConcurrency) {
                maxConcurrency = currentConcurrency;
            }
            await new Promise((resolve) => setTimeout(resolve, 20));
            currentConcurrency--;
        });

        expect(maxConcurrency).toBeLessThanOrEqual(5);
        expect(maxConcurrency).toBeGreaterThan(1);
        expect(currentConcurrency).toBe(0);
    });

    it("works with async functions that return different types", async () => {
        const items = ["fern", "oak", "maple"];
        const results = await processInParallelBatches(items, 2, async (item) => ({
            plant: item,
            length: item.length
        }));
        expect(results).toEqual([
            { plant: "fern", length: 4 },
            { plant: "oak", length: 3 },
            { plant: "maple", length: 5 }
        ]);
    });
});
