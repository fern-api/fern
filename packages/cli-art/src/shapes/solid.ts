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

const surfaces = new WeakMap<Shape, Map<number, SurfacePoint[]>>();

/**
 * Renders the shape as an extruded 3D solid, turned `angle` radians around its vertical axis (with a
 * slight tilt unless `tilt` is false), lit from the upper left, into a grid of cells, or of half-cell
 * pixels when `subRows` is 2.
 */
export function renderSolid({
    shape,
    angle,
    width,
    height,
    size = 0.92,
    fitShape = false,
    tilt = true,
    perspective = true,
    subRows = 1,
    resolution = RESOLUTION
}: {
    shape: Shape;
    angle: number;
    width: number;
    height: number;
    /** Fraction of the grid the shape spans when facing forward. */
    size?: number;
    /**
     * Scale to the shape's own proportions, so a wide wordmark fills a wide grid. By default the
     * shape's longer side spans the grid's shorter dimension, which keeps it inside a square frame.
     */
    fitShape?: boolean;
    /** Wobble around the horizontal axis while turning. */
    tilt?: boolean;
    /** Nearer parts look larger. When false, the turn only narrows and widens the shape. */
    perspective?: boolean;
    /** Rows per cell: 2 returns twice as many rows, for half-block pixels. */
    subRows?: 1 | 2;
    /** Samples across the shape's longer side. */
    resolution?: number;
}): SolidFrame {
    const rows = height * subRows;
    const frame: SolidFrame = Array.from({ length: rows }, () =>
        new Array<SolidCell | undefined>(width).fill(undefined)
    );
    const depth: number[][] = Array.from({ length: rows }, () => new Array<number>(width).fill(0));
    const tiltAngle = tilt ? 0.3 * Math.sin(angle) : 0;
    const rotate = (vector: Vector3): Vector3 => rotateX(rotateY(vector, angle), tiltAngle);
    const rowAspect = CELL_ASPECT / subRows;
    const gridHeight = height * CELL_ASPECT;
    const spanX = Math.min(1, shape.aspectRatio);
    const spanY = Math.min(1, 1 / shape.aspectRatio);
    const scale = (fitShape ? Math.min(width / spanX, gridHeight / spanY) / 2 : Math.min(width, gridHeight) / 2) * size;

    for (const point of getSurface(shape, resolution)) {
        const position = rotate(point.position);
        const inverseDepth = 1 / (CAMERA_DISTANCE + position.z);
        const projection = perspective ? CAMERA_DISTANCE * inverseDepth : 1;
        const column = Math.floor(width / 2 + position.x * scale * projection);
        const row = Math.floor((gridHeight / 2 - position.y * scale * projection) / rowAspect);
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
function getSurface(shape: Shape, resolution: number): SurfacePoint[] {
    const byResolution = surfaces.get(shape) ?? new Map<number, SurfacePoint[]>();
    surfaces.set(shape, byResolution);
    const cached = byResolution.get(resolution);
    if (cached !== undefined) {
        return cached;
    }
    const aspect = shape.aspectRatio;
    const columns = aspect >= 1 ? resolution : Math.max(8, Math.round(resolution * aspect));
    const rows = aspect >= 1 ? Math.max(8, Math.round(resolution / aspect)) : resolution;
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
    byResolution.set(resolution, points);
    return points;
}
