import { PNG } from "pngjs";
import { describe, expect, it } from "vitest";
import { logoToBanner, renderBanner } from "../logoToBanner.js";

function image(width: number, height: number, pixels: Array<[number, number, number, number]>) {
    return { width, height, data: Uint8Array.from(pixels.flat()) };
}

const RED: [number, number, number, number] = [255, 0, 0, 255];
const BLUE: [number, number, number, number] = [0, 0, 255, 255];
const CLEAR: [number, number, number, number] = [0, 0, 0, 0];

describe("renderBanner", () => {
    it("draws top and bottom pixels as one half-block cell", () => {
        expect(renderBanner(image(1, 2, [RED, BLUE]), { width: 1 })).toBe(
            "\x1b[38;2;255;0;0m\x1b[48;2;0;0;255m▀\x1b[0m\n"
        );
    });

    it("uses ▀ / ▄ when only one half is opaque and space when neither is", () => {
        expect(renderBanner(image(3, 2, [RED, CLEAR, CLEAR, CLEAR, CLEAR, BLUE]), { width: 3 })).toBe(
            "\x1b[38;2;255;0;0m▀\x1b[0m \x1b[38;2;0;0;255m▄\x1b[0m\n"
        );
    });

    it("shape mode emits uncoloured blocks for the runtime gradient", () => {
        expect(renderBanner(image(3, 2, [RED, RED, CLEAR, RED, CLEAR, BLUE]), { width: 3, mode: "shape" })).toBe(
            "█▀▄\n"
        );
    });

    it("crops transparent margins", () => {
        expect(
            renderBanner(
                image(3, 4, [CLEAR, CLEAR, CLEAR, CLEAR, RED, CLEAR, CLEAR, RED, CLEAR, CLEAR, CLEAR, CLEAR]),
                {
                    width: 3,
                    mode: "shape"
                }
            )
        ).toBe("█\n");
    });

    it("downsamples to the requested width and keeps the aspect ratio", () => {
        const pixels = Array.from({ length: 8 * 4 }, () => RED);
        const banner = renderBanner(image(8, 4, pixels), { width: 4, mode: "shape" });
        expect(banner).toBe("████\n");
    });

    it("leaves the bottom half empty for an odd number of pixel rows", () => {
        expect(renderBanner(image(1, 1, [RED]), { width: 1, mode: "shape" })).toBe("▀\n");
        expect(renderBanner(image(1, 3, [RED, RED, RED]), { width: 1, mode: "shape" })).toBe("█\n▀\n");
    });

    it("rejects a logo whose strokes vanish when scaled down", () => {
        const thinLine = image(
            8,
            8,
            Array.from({ length: 64 }, (_, i) => (i % 8 === 0 ? RED : CLEAR))
        );
        thinLine.data.set(RED, 7 * 4);
        expect(() => renderBanner(thinLine, { width: 1, mode: "shape" })).toThrow(/too thin/);
    });

    it("rejects an invalid width or alpha threshold", () => {
        expect(() => renderBanner(image(1, 1, [RED]), { width: 2.5 })).toThrow(/Invalid width/);
        expect(() => renderBanner(image(1, 1, [CLEAR]), { alphaThreshold: 0 })).toThrow(/Invalid alpha threshold/);
    });

    it("rejects a logo with no visible pixels", () => {
        expect(() => renderBanner(image(1, 1, [CLEAR]))).toThrow("no visible pixels");
    });
});

describe("logoToBanner", () => {
    it("rasterises an SVG", () => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"><rect width="20" height="10" fill="#4949F2"/></svg>`;
        const banner = logoToBanner(new TextEncoder().encode(svg), { width: 10, mode: "shape" });
        expect(banner).toBe(`${`${"█".repeat(10)}\n`.repeat(2)}${"▀".repeat(10)}\n`);
    });

    it("decodes a PNG", () => {
        const png = new PNG({ width: 2, height: 2 });
        png.data.set([...RED, ...RED, ...BLUE, ...BLUE]);
        const banner = logoToBanner(PNG.sync.write(png), { width: 2 });
        expect(banner).toBe("\x1b[38;2;255;0;0m\x1b[48;2;0;0;255m▀\x1b[0m".repeat(2) + "\n");
    });

    it("rejects other formats", () => {
        expect(() => logoToBanner(new TextEncoder().encode("GIF89a"))).toThrow("expected a PNG or SVG");
    });
});
