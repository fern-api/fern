import { CELL_ASPECT } from "../core/animation";
import type { Rgb } from "../core/color";
import { dot, normalize, rotateX, rotateY, type Vector3 } from "../core/math";
import type { Shape } from "./shape";

interface SurfacePoint {
    position: Vector3;
    normal: Vector3;
    color: Rgb;
}

/** A lit cell of the rendered solid. */
export interface SolidCell {
    /** Lighting, 0 to 1. */
    intensity: number;
    color: Rgb;
}

export type SolidFrame = Array<Array<SolidCell | undefined>>;

const RESOLUTION = 110;
const HALF_DEPTH = 0.09;
const DEPTH_STEP = 0.015;
const CAMERA_DISTANCE = 3.5;
const LIGHT = normalize({ x: -0.35, y: 0.45, z: -1 });
const AMBIENT = 0.12;

const surfaces = new WeakMap<Shape, SurfacePoint[]>();

/**
 * Renders the shape as an extruded 3D solid, turned `angle` radians around its vertical axis (with a
 * slight tilt), lit from the upper left, into a grid of cells.
 */
export function renderSolid({
    shape,
    angle,
    width,
    height,
    size = 0.92
}: {
    shape: Shape;
    angle: number;
    width: number;
    height: number;
    /** Fraction of the grid the shape spans when facing forward. */
    size?: number;
}): SolidFrame {
    const frame: SolidFrame = Array.from({ length: height }, () =>
        new Array<SolidCell | undefined>(width).fill(undefined)
    );
    const depth: number[][] = Array.from({ length: height }, () => new Array<number>(width).fill(0));
    const tilt = 0.3 * Math.sin(angle);
    const rotate = (vector: Vector3): Vector3 => rotateX(rotateY(vector, angle), tilt);
    const gridHeight = height * CELL_ASPECT;
    const scale = (Math.min(width, gridHeight) / 2) * size;

    for (const point of getSurface(shape)) {
        const position = rotate(point.position);
        const inverseDepth = 1 / (CAMERA_DISTANCE + position.z);
        const perspective = CAMERA_DISTANCE * inverseDepth;
        const column = Math.floor(width / 2 + position.x * scale * perspective);
        const row = Math.floor((gridHeight / 2 - position.y * scale * perspective) / CELL_ASPECT);
        const depthRow = depth[row];
        const frameRow = frame[row];
        if (depthRow === undefined || frameRow === undefined || column < 0 || column >= width) {
            continue;
        }
        if (inverseDepth <= (depthRow[column] ?? 0)) {
            continue;
        }
        depthRow[column] = inverseDepth;
        frameRow[column] = {
            intensity: AMBIENT + (1 - AMBIENT) * Math.max(0, dot(rotate(point.normal), LIGHT)),
            color: point.color
        };
    }
    return frame;
}

/**
 * Front and back faces of the shape, plus side walls along its outline, as a point cloud in
 * [-1, 1] coordinates (the longer side spans the full range).
 */
function getSurface(shape: Shape): SurfacePoint[] {
    const cached = surfaces.get(shape);
    if (cached !== undefined) {
        return cached;
    }
    const aspect = shape.aspectRatio;
    const columns = aspect >= 1 ? RESOLUTION : Math.max(8, Math.round(RESOLUTION * aspect));
    const rows = aspect >= 1 ? Math.max(8, Math.round(RESOLUTION / aspect)) : RESOLUTION;
    const spanX = aspect >= 1 ? 1 : aspect;
    const spanY = aspect >= 1 ? 1 / aspect : 1;
    const colors: Array<Rgb | undefined> = new Array(columns * rows).fill(undefined);
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const sample = shape.sample((column + 0.5) / columns, (row + 0.5) / rows);
            if (sample !== undefined && sample.alpha >= 0.5) {
                colors[row * columns + column] = sample.color;
            }
        }
    }
    const inside = (row: number, column: number): boolean =>
        row >= 0 && row < rows && column >= 0 && column < columns && colors[row * columns + column] !== undefined;

    const points: SurfacePoint[] = [];
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const color = colors[row * columns + column];
            if (color === undefined) {
                continue;
            }
            const x = (((column + 0.5) / columns) * 2 - 1) * spanX;
            const y = (1 - ((row + 0.5) / rows) * 2) * spanY;
            points.push({ position: { x, y, z: -HALF_DEPTH }, normal: { x: 0, y: 0, z: -1 }, color });
            points.push({ position: { x, y, z: HALF_DEPTH }, normal: { x: 0, y: 0, z: 1 }, color });
            // Outline samples become side walls, facing away from the shape's interior.
            let normalX = 0;
            let normalY = 0;
            if (!inside(row, column - 1)) {
                normalX -= 1;
            }
            if (!inside(row, column + 1)) {
                normalX += 1;
            }
            if (!inside(row - 1, column)) {
                normalY += 1;
            }
            if (!inside(row + 1, column)) {
                normalY -= 1;
            }
            if (normalX === 0 && normalY === 0) {
                continue;
            }
            const normal = normalize({ x: normalX, y: normalY, z: 0 });
            for (let z = -HALF_DEPTH; z <= HALF_DEPTH; z += DEPTH_STEP) {
                points.push({ position: { x, y, z }, normal, color });
            }
        }
    }
    surfaces.set(shape, points);
    return points;
}
