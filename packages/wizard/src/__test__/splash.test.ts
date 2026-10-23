import { describe, expect, it } from "vitest";
import { scanningProgress } from "../splash";

describe("splash progress bar", () => {
    it("lights blocks one at a time and holds the last one until the scan finishes", () => {
        const progress = Array.from({ length: 200 }, (_, frame) => scanningProgress(frame));
        expect(progress[0]).toBe(0);
        expect(progress.every((lit, frame) => frame === 0 || lit - (progress[frame - 1] ?? 0) <= 1)).toBe(true);
        expect(new Set(progress)).toEqual(new Set([0, 1, 2, 3, 4, 5, 6, 7]));
        expect(Math.max(...progress)).toBe(7);
    });
});
