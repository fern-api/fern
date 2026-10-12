import { describe, expect, it } from "vitest";
import { mapWithConcurrency } from "../mapWithConcurrency.js";

describe("mapWithConcurrency", () => {
    it("returns results in input order and never exceeds the limit", async () => {
        let inFlight = 0;
        let maxInFlight = 0;
        const delays = [30, 5, 20, 1, 10, 15, 2];
        const results = await mapWithConcurrency(delays, 3, async (delay, index) => {
            inFlight++;
            maxInFlight = Math.max(maxInFlight, inFlight);
            await new Promise((resolve) => setTimeout(resolve, delay));
            inFlight--;
            return index * 10;
        });
        expect(results).toEqual([0, 10, 20, 30, 40, 50, 60]);
        expect(maxInFlight).toBe(3);
    });

    it("runs serially when the limit is below 1", async () => {
        let inFlight = 0;
        let maxInFlight = 0;
        await mapWithConcurrency([1, 2, 3], 0, async () => {
            inFlight++;
            maxInFlight = Math.max(maxInFlight, inFlight);
            await new Promise((resolve) => setTimeout(resolve, 1));
            inFlight--;
        });
        expect(maxInFlight).toBe(1);
    });

    it("rejects when any call rejects", async () => {
        await expect(
            mapWithConcurrency([1, 2, 3], 2, async (item) => {
                if (item === 2) {
                    throw new Error("boom");
                }
                return item;
            })
        ).rejects.toThrow("boom");
    });

    it("stops starting new calls after a failure", async () => {
        const started: number[] = [];
        await expect(
            mapWithConcurrency([0, 1, 2, 3, 4, 5], 2, async (item) => {
                started.push(item);
                await new Promise((resolve) => setTimeout(resolve, 5));
                if (item === 0) {
                    throw new Error("boom");
                }
            })
        ).rejects.toThrow("boom");
        expect(started).toEqual([0, 1]);
    });

    it("waits for in-flight calls before rejecting", async () => {
        let finished = 0;
        await expect(
            mapWithConcurrency([0, 1, 2], 3, async (item) => {
                if (item === 0) {
                    throw new Error("boom");
                }
                await new Promise((resolve) => setTimeout(resolve, 10));
                finished++;
            })
        ).rejects.toThrow("boom");
        expect(finished).toBe(2);
    });

    it("handles an empty list", async () => {
        expect(await mapWithConcurrency([], 4, async () => 1)).toEqual([]);
    });
});
