import { CELL_ASPECT } from "../core/animation";
import type { Rgb } from "../core/color";
import type { Shape } from "./shape";

export interface RasterCell {
    /** Share of the cell the shape covers, from 0 to 1. */
    coverage: number;
    /** Average color of the covered part. */
    color: Rgb | undefined;
}

export interface RasterOptions {
    width: number;
    height: number;
    /** Fraction of the grid the shape may fill. Defaults to 0.92. */
    size?: number;
    /** Samples per cell along each axis. Defaults to 4. */
    supersample?: number;
}

/**
 * Lays a shape onto a grid of terminal cells, centered and scaled to fit while keeping its
 * proportions (terminal cells are taller than they are wide).
 */
export function rasterize(
    shape: Shape,
    { width, height, size = 0.92, supersample = 4 }: RasterOptions
): RasterCell[][] {
    const box = fitBox(shape.aspectRatio, width, height, size);
    return Array.from({ length: height }, (_, row) =>
        Array.from({ length: width }, (_, column): RasterCell => {
            let alphaSum = 0;
            let red = 0;
            let green = 0;
            let blue = 0;
            for (let sy = 0; sy < supersample; sy++) {
                for (let sx = 0; sx < supersample; sx++) {
                    const x = column + (sx + 0.5) / supersample;
                    const y = (row + (sy + 0.5) / supersample) * CELL_ASPECT;
                    const u = (x - box.left) / box.width;
                    const v = (y - box.top) / box.height;
                    if (u < 0 || u > 1 || v < 0 || v > 1) {
                        continue;
                    }
                    const sample = shape.sample(u, v);
                    if (sample === undefined) {
                        continue;
                    }
                    alphaSum += sample.alpha;
                    red += sample.color[0] * sample.alpha;
                    green += sample.color[1] * sample.alpha;
                    blue += sample.color[2] * sample.alpha;
                }
            }
            const samples = supersample * supersample;
            return {
                coverage: alphaSum / samples,
                color:
                    alphaSum > 0
                        ? [Math.round(red / alphaSum), Math.round(green / alphaSum), Math.round(blue / alphaSum)]
                        : undefined
            };
        })
    );
}

/** Where the shape sits on the grid, in physical units (cell widths). */
export function fitBox(
    aspectRatio: number,
    width: number,
    height: number,
    size: number
): { left: number; top: number; width: number; height: number } {
    const gridWidth = width;
    const gridHeight = height * CELL_ASPECT;
    const maxWidth = gridWidth * size;
    const maxHeight = gridHeight * size;
    const boxWidth = maxWidth / maxHeight > aspectRatio ? maxHeight * aspectRatio : maxWidth;
    const boxHeight = boxWidth / aspectRatio;
    return { left: (gridWidth - boxWidth) / 2, top: (gridHeight - boxHeight) / 2, width: boxWidth, height: boxHeight };
}
