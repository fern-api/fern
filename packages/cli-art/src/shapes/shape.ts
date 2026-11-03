import { readFile } from "fs/promises";
import path from "path";
import { parseColor, type Rgb } from "../core/color";
import { decodePng, type Pixels } from "./png";
import { colorAt, parseSvg } from "./svg";

export interface ShapeSample {
    /** Coverage, from 0 (transparent) to 1 (solid). */
    alpha: number;
    color: Rgb;
}

/** Artwork that animations draw from: coverage and color across the unit square. */
export interface Shape {
    /** Width divided by height. */
    readonly aspectRatio: number;
    /** The artwork at (u, v), each in [0, 1], with v pointing down; undefined where it's empty. */
    sample(u: number, v: number): ShapeSample | undefined;
}

/** A shape from SVG markup, cropped to what it draws. */
export function fromSvg(source: string): Shape {
    const document = parseSvg(source);
    const bounds =
        document.layers.length === 0
            ? document.viewBox
            : {
                  minX: Math.min(...document.layers.map((layer) => layer.bounds.minX)),
                  minY: Math.min(...document.layers.map((layer) => layer.bounds.minY)),
                  maxX: Math.max(...document.layers.map((layer) => layer.bounds.maxX)),
                  maxY: Math.max(...document.layers.map((layer) => layer.bounds.maxY))
              };
    const width = Math.max(1e-9, bounds.maxX - bounds.minX);
    const height = Math.max(1e-9, bounds.maxY - bounds.minY);
    return {
        aspectRatio: width / height,
        sample(u, v) {
            const color = colorAt(document, { x: bounds.minX + u * width, y: bounds.minY + v * height });
            return color === undefined ? undefined : { alpha: 1, color };
        }
    };
}

/** A shape from a single SVG path, filled with one color. */
export function fromSvgPath(
    data: string,
    options: { color?: string | Rgb; fillRule?: "nonzero" | "evenodd" } = {}
): Shape {
    const color =
        typeof options.color === "string" ? (parseColor(options.color) ?? [0, 0, 0]) : (options.color ?? [0, 0, 0]);
    const escaped = data.replace(/"/g, "");
    return fromSvg(
        `<svg xmlns="http://www.w3.org/2000/svg"><path d="${escaped}" fill="rgb(${color.join(",")})" fill-rule="${options.fillRule ?? "nonzero"}"/></svg>`
    );
}

/**
 * A shape from RGBA pixels. Images without transparency get their background (the color shared by
 * the corners) treated as transparent, and every image is cropped to its visible content.
 */
export function fromPixels(pixels: Pixels): Shape {
    const { width, height, data } = pixels;
    const alphaAt = buildAlpha(pixels);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if ((alphaAt[y * width + x] ?? 0) > 0.1) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }
    if (maxX < 0) {
        return { aspectRatio: 1, sample: () => undefined };
    }
    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    return {
        aspectRatio: cropWidth / cropHeight,
        sample(u, v) {
            const x = Math.min(maxX, minX + Math.floor(u * cropWidth));
            const y = Math.min(maxY, minY + Math.floor(v * cropHeight));
            const alpha = alphaAt[y * width + x] ?? 0;
            if (alpha <= 0) {
                return undefined;
            }
            const offset = (y * width + x) * 4;
            return { alpha, color: [data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0] };
        }
    };
}

export function fromPng(buffer: Uint8Array): Shape {
    return fromPixels(decodePng(buffer));
}

/** Loads a logo from an .svg or .png file. */
export async function loadShape(filePath: string): Promise<Shape> {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === ".svg") {
        return fromSvg(await readFile(filePath, "utf8"));
    }
    if (extension === ".png") {
        return fromPng(await readFile(filePath));
    }
    throw new Error(`Unsupported logo format "${extension}". Use an .svg or .png file.`);
}

/** Per-pixel alpha in [0, 1], keying out a solid background when the image has no transparency. */
function buildAlpha({ width, height, data }: Pixels): Float32Array {
    const alpha = new Float32Array(width * height);
    let hasTransparency = false;
    for (let index = 0; index < width * height; index++) {
        const value = (data[index * 4 + 3] ?? 255) / 255;
        alpha[index] = value;
        hasTransparency ||= value < 0.98;
    }
    if (hasTransparency) {
        return alpha;
    }
    const corners = [0, width - 1, (height - 1) * width, height * width - 1].map((index) => [
        data[index * 4] ?? 0,
        data[index * 4 + 1] ?? 0,
        data[index * 4 + 2] ?? 0
    ]);
    const background = corners[0] ?? [255, 255, 255];
    const cornersAgree = corners.every((corner) => distance(corner, background) < 24);
    if (!cornersAgree) {
        return alpha;
    }
    for (let index = 0; index < width * height; index++) {
        const pixel = [data[index * 4] ?? 0, data[index * 4 + 1] ?? 0, data[index * 4 + 2] ?? 0];
        // Fade near-background pixels (anti-aliased edges) instead of cutting them off.
        alpha[index] = Math.min(1, Math.max(0, (distance(pixel, background) - 20) / 60));
    }
    return alpha;
}

function distance(left: number[], right: number[]): number {
    return Math.hypot(
        (left[0] ?? 0) - (right[0] ?? 0),
        (left[1] ?? 0) - (right[1] ?? 0),
        (left[2] ?? 0) - (right[2] ?? 0)
    );
}
