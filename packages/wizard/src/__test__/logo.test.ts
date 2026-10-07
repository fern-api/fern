import { describe, expect, it } from "vitest";
import { parsePath, renderLogoFrame } from "../logo";

function coverage(angle: number): number {
    return renderLogoFrame({ angle, width: 44, height: 22 })
        .flat()
        .filter((cell) => cell !== undefined).length;
}

describe("logo rendering", () => {
    it("flattens absolute SVG path commands into a polygon", () => {
        const polygon = parsePath("M0 0L10 0H10V10C10 10 0 10 0 10Z");
        expect(polygon.slice(0, 4)).toEqual([
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 }
        ]);
        // The cubic curve is flattened into 10 segments ending at its end point.
        expect(polygon).toHaveLength(14);
        expect(polygon.at(-1)?.x).toBeCloseTo(0);
        expect(polygon.at(-1)?.y).toBeCloseTo(10);
        expect(() => parsePath("M0 0Q1 1 2 2")).toThrow("Unsupported SVG path command");
    });

    it("renders a frame of the requested size", () => {
        const frame = renderLogoFrame({ angle: 0, width: 44, height: 22 });
        expect(frame).toHaveLength(22);
        expect(frame.every((row) => row.length === 44)).toBe(true);
        expect(frame.flat().every((cell) => cell === undefined || (cell >= 0 && cell <= 1))).toBe(true);
    });

    it("covers less of the screen when the logo is turned edge-on", () => {
        expect(coverage(0)).toBeGreaterThan(300);
        expect(coverage(Math.PI / 2)).toBeLessThan(coverage(0) / 3);
    });
});
