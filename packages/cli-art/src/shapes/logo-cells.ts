import type { Rgb } from "../core/color";
import { rasterize } from "./raster";
import type { Shape } from "./shape";

export interface LogoCell {
    row: number;
    column: number;
    /** Lighting, 0 to 1: brightest on the top-left edges, darkening toward the bottom right. */
    intensity: number;
    /** The logo's own color here. */
    color: Rgb | undefined;
    /** Cell center in [-1, 1] coordinates, y pointing up. */
    center: { x: number; y: number };
}

export interface DepthCell {
    row: number;
    column: number;
    /** The color of the face cell casting this depth. */
    color: Rgb | undefined;
}

/** Minimum share of a cell the shape must cover to count as part of the face. */
const FACE_COVERAGE = 0.4;
/**
 * The logo is extruded down and to the right: one row down and two columns across is about one cell of
 * depth, since terminal cells are roughly twice as tall as they are wide.
 */
const DEPTH_OFFSETS: Array<[number, number]> = [
    [0, 1],
    [1, 1],
    [1, 2]
];

const cache = new WeakMap<Shape, Map<string, LogoCell[]>>();

/**
 * The front face of a logo laid out on a grid, leaving room for its extrusion on the right and bottom.
 * The face is lit from the top left, and its top and left edges catch the most light, like a bevel.
 */
export function logoCells(shape: Shape, width: number, height: number, size = 0.95): LogoCell[] {
    const key = `${width}x${height}@${size}`;
    const shapeCache = cache.get(shape) ?? new Map<string, LogoCell[]>();
    cache.set(shape, shapeCache);
    const cached = shapeCache.get(key);
    if (cached !== undefined) {
        return cached;
    }
    const faceWidth = Math.max(1, width - 2);
    const faceHeight = Math.max(1, height - 1);
    const raster = rasterize(shape, { width: faceWidth, height: faceHeight, size });
    const face = new Set<string>();
    raster.forEach((row, rowIndex) =>
        row.forEach((cell, column) => {
            if (cell.coverage >= FACE_COVERAGE) {
                face.add(`${rowIndex}:${column}`);
            }
        })
    );
    const cells = [...face].map((cellKey): LogoCell => {
        const [row = 0, column = 0] = cellKey.split(":").map(Number);
        const edge = !face.has(`${row - 1}:${column}`) || !face.has(`${row}:${column - 1}`);
        const falloff = (row / faceHeight) * 0.6 + (column / faceWidth) * 0.4;
        return {
            row,
            column,
            intensity: edge ? 1 : 0.85 - 0.3 * falloff,
            color: raster[row]?.[column]?.color,
            center: { x: ((column + 0.5) / width) * 2 - 1, y: 1 - ((row + 0.5) / height) * 2 }
        };
    });
    shapeCache.set(key, cells);
    return cells;
}

/** The logo's sides: the face pushed down and to the right, wherever the face isn't. */
export function depthCells(cells: LogoCell[], width: number, height: number): DepthCell[] {
    const face = new Set(cells.map((cell) => `${cell.row}:${cell.column}`));
    const depth = new Map<string, DepthCell>();
    for (const cell of cells) {
        for (const [rowOffset, columnOffset] of DEPTH_OFFSETS) {
            const row = cell.row + rowOffset;
            const column = cell.column + columnOffset;
            const key = `${row}:${column}`;
            if (row < height && column < width && !face.has(key) && !depth.has(key)) {
                depth.set(key, { row, column, color: cell.color });
            }
        }
    }
    return [...depth.values()];
}
