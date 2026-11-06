import { asyncPool } from "../asyncPool.js";
import { delay } from "../delay/delay.js";

describe("asyncPool", () => {
    it("returns results in input order", async () => {
        const results = await asyncPool(2, [30, 1, 10], async (ms) => {
            await delay(ms);
            return ms * 2;
        });
        expect(results).toEqual([60, 2, 20]);
    });

    it("never runs more than `limit` tasks at once", async () => {
        let running = 0;
        let maxRunning = 0;
        await asyncPool(
            3,
            Array.from({ length: 10 }, (_, i) => i),
            async () => {
                running++;
                maxRunning = Math.max(maxRunning, running);
                await delay(5);
                running--;
            }
        );
        expect(maxRunning).toBeLessThanOrEqual(3);
    });

    it("passes the index to the callback", async () => {
        const indexes = await asyncPool(2, ["a", "b", "c"], async (_item, index) => index);
        expect(indexes).toEqual([0, 1, 2]);
    });

    it("returns an empty array for no items", async () => {
        expect(await asyncPool(2, [], async () => 1)).toEqual([]);
    });

    it("rejects when a task throws", async () => {
        await expect(
            asyncPool(2, [1, 2], async (n) => {
                if (n === 2) {
                    throw new Error("boom");
                }
                return n;
            })
        ).rejects.toThrow("boom");
    });
});
