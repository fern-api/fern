import { describe, expect, it } from "vitest";
import { type OrbLayer, renderOrbFrame } from "../orb";

function layers(angle: number): Map<OrbLayer, number> {
    const counts = new Map<OrbLayer, number>();
    for (const cell of renderOrbFrame({ angle, width: 36, height: 18 }).flat()) {
        if (cell !== undefined) {
            counts.set(cell.layer, (counts.get(cell.layer) ?? 0) + 1);
        }
    }
    return counts;
}

describe("orb rendering", () => {
    it("draws the logo inside a glass orb with a rim, grid lines, and a glint", () => {
        const counts = layers(0);
        expect(counts.get("logo")).toBeGreaterThan(120);
        expect(counts.get("rim")).toBeGreaterThan(50);
        expect(counts.get("grid")).toBeGreaterThan(0);
        expect(counts.get("glint")).toBeGreaterThan(0);
    });

    it("keeps everything inside the orb's circle", () => {
        const frame = renderOrbFrame({ angle: 1, width: 36, height: 18 });
        expect(frame[0]?.[0]).toBeUndefined();
        expect(frame[17]?.[35]).toBeUndefined();
        expect(frame[9]?.[18]).toBeDefined();
    });

    it("shows less of the logo when it is turned edge-on", () => {
        expect(layers(Math.PI / 2).get("logo") ?? 0).toBeLessThan((layers(0).get("logo") ?? 0) / 2);
    });
});
