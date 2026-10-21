import { describe, expect, it } from "vitest";
import { decodePng } from "../shapes/png";
import { rasterize } from "../shapes/raster";
import { fromPng, fromSvg, fromSvgPath } from "../shapes/shape";
import { colorAt, parseSvg } from "../shapes/svg";
import { isInside, parseSvgPath } from "../shapes/svg-path";
import { encodePng, SQUARE_PATH } from "./helpers";

describe("parseSvgPath", () => {
    it("parses absolute and relative lines into closed polygons", () => {
        expect(parseSvgPath("M0 0 L10 0 l0 10 h-10 z")).toEqual([
            [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 }
            ]
        ]);
    });

    it("flattens curves and arcs through their end points", () => {
        const [curve] = parseSvgPath("M0 0 C0 10 10 10 10 0 A5 5 0 0 1 0 0");
        expect(curve?.length).toBeGreaterThan(10);
        expect(curve?.some((point) => Math.abs(point.x - 10) < 1e-9 && Math.abs(point.y) < 1e-9)).toBe(true);
    });

    it("honors fill rules for holes", () => {
        const ring = parseSvgPath("M0 0H10V10H0Z M3 3H7V7H3Z");
        expect(isInside({ x: 5, y: 5 }, ring, "evenodd")).toBe(false);
        expect(isInside({ x: 5, y: 5 }, ring, "nonzero")).toBe(true);
        expect(isInside({ x: 1, y: 1 }, ring, "evenodd")).toBe(true);
    });
});

describe("parseSvg", () => {
    it("inherits fills from groups and applies transforms", () => {
        const document = parseSvg(
            `<svg viewBox="0 0 20 10"><g fill="#ff0000" transform="translate(10 0)"><rect width="10" height="10"/></g></svg>`
        );
        expect(colorAt(document, { x: 15, y: 5 })).toEqual([255, 0, 0]);
        expect(colorAt(document, { x: 5, y: 5 })).toBeUndefined();
    });

    it("ignores shapes inside defs and unfilled shapes", () => {
        const document = parseSvg(
            `<svg viewBox="0 0 10 10"><defs><rect width="10" height="10"/></defs><circle cx="5" cy="5" r="4" fill="none"/></svg>`
        );
        expect(document.layers).toHaveLength(0);
    });

    it("draws later shapes on top", () => {
        const document = parseSvg(
            `<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="#000"/><rect x="2" y="2" width="6" height="6" style="fill: #00ff00"/></svg>`
        );
        expect(colorAt(document, { x: 5, y: 5 })).toEqual([0, 255, 0]);
        expect(colorAt(document, { x: 1, y: 1 })).toEqual([0, 0, 0]);
    });

    it("maps bounding-box gradients across each shape", () => {
        const document = parseSvg(`<svg viewBox="0 0 100 10">
            <defs><linearGradient id="g"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
            <rect width="100" height="10" fill="url(#g)"/></svg>`);
        expect(colorAt(document, { x: 0, y: 5 })).toEqual([0, 0, 0]);
        expect(colorAt(document, { x: 50, y: 5 })?.[0]).toBeCloseTo(128, -1);
        expect(colorAt(document, { x: 99.99, y: 5 })?.[0]).toBeGreaterThan(250);
    });

    it("maps user-space gradients across the whole drawing, not each shape", () => {
        const document = parseSvg(`<svg viewBox="0 0 100 10">
            <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" x2="100"><stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="#fff"/></linearGradient>
            <g fill="url(#g)"><rect width="10" height="10"/><rect x="90" width="10" height="10"/></g></svg>`);
        expect(colorAt(document, { x: 9, y: 5 })?.[0]).toBeLessThan(40);
        expect(colorAt(document, { x: 91, y: 5 })?.[0]).toBeGreaterThan(215);
    });

    it("respects stop offsets, vertical gradients, and href inheritance", () => {
        const document = parseSvg(`<svg viewBox="0 0 10 100">
            <linearGradient id="base"><stop offset="0.5" stop-color="#f00"/><stop offset="1" stop-color="#00f"/></linearGradient>
            <linearGradient id="down" href="#base" x1="0" y1="0" x2="0" y2="1"/>
            <rect width="10" height="100" fill="url(#down)"/></svg>`);
        expect(colorAt(document, { x: 5, y: 25 })).toEqual([255, 0, 0]);
        expect(colorAt(document, { x: 5, y: 99.99 })?.[2]).toBeGreaterThan(250);
    });

    it("spreads radial gradients from the center", () => {
        const document = parseSvg(`<svg viewBox="0 0 10 10">
            <radialGradient id="r"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
            <rect width="10" height="10" fill="url(#r)"/></svg>`);
        expect(colorAt(document, { x: 5, y: 5 })).toEqual([255, 255, 255]);
        expect(colorAt(document, { x: 9.99, y: 5 })?.[0]).toBeLessThan(5);
    });
});

describe("decodePng", () => {
    it("decodes RGBA pixels", () => {
        const pixels = decodePng(encodePng(3, 2, (x, y) => [x * 100, y * 100, 7, 255]));
        expect(pixels.width).toBe(3);
        expect(pixels.height).toBe(2);
        expect([...pixels.data.slice(0, 4)]).toEqual([0, 0, 7, 255]);
        expect([...pixels.data.slice((1 * 3 + 2) * 4, (1 * 3 + 2) * 4 + 4)]).toEqual([200, 100, 7, 255]);
    });

    it("rejects files that aren't PNGs", () => {
        expect(() => decodePng(new Uint8Array([1, 2, 3]))).toThrow();
    });
});

describe("shapes", () => {
    it("crops SVG shapes to what is drawn", () => {
        const shape = fromSvg(
            `<svg viewBox="0 0 100 100"><rect x="40" y="45" width="20" height="10" fill="#123456"/></svg>`
        );
        expect(shape.aspectRatio).toBeCloseTo(2);
        expect(shape.sample(0.5, 0.5)).toEqual({ alpha: 1, color: [0x12, 0x34, 0x56] });
    });

    it("keys out a flat background from opaque images and crops to the logo", () => {
        const png = encodePng(20, 20, (x, y) =>
            x >= 5 && x < 15 && y >= 8 && y < 12 ? [200, 30, 30, 255] : [255, 255, 255, 255]
        );
        const shape = fromPng(png);
        expect(shape.aspectRatio).toBeCloseTo(2.5, 0);
        expect(shape.sample(0.5, 0.5)?.color).toEqual([200, 30, 30]);
    });

    it("rasterizes coverage and color onto a grid", () => {
        const grid = rasterize(fromSvgPath(SQUARE_PATH, { color: "#00ff00" }), { width: 10, height: 5, size: 1 });
        expect(grid).toHaveLength(5);
        const covered = grid.flat().filter((cell) => cell.coverage > 0.5);
        expect(covered.length).toBeGreaterThan(10);
        expect(covered.every((cell) => cell.color?.[1] === 255)).toBe(true);
    });
});
