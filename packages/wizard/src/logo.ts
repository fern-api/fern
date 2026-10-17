// Renders the Fern logo as an extruded 3D solid into a grid of character cells, donut.c style.

const FERN_LOGO_PATH =
    "M86.4274 46.4133C80.1854 41.1361 70.7819 39.0206 62.4477 45.1812C62.0641 45.4601 61.5875 44.9836 61.8781 44.6116C63.8541 42.066 66.144 39.3228 67.9922 36.568C69.8752 33.7435 72.6881 31.721 75.9312 30.733C93.1924 25.5023 88.0082 0 88.0082 0C88.0082 0 61.3434 1.7203 64.6329 24.7235C65.1792 28.571 64.1563 32.4881 61.7502 35.5452C58.7978 39.2763 55.3688 42.8448 52.8813 45.4253C52.3583 45.96 51.4749 45.4485 51.6841 44.7278C54.0902 36.6262 55.8454 24.0959 47.5112 16.0174L35.7829 6.27678L33.5279 9.25243C26.821 18.098 28.7854 30.5702 37.6427 37.2655C42.7222 41.1013 45.0237 45.2742 44.6634 49.8539C44.4425 52.5971 43.1988 55.1659 41.339 57.2C37.8403 61.0358 34.574 65.1506 32.0517 69.9163C31.703 70.5789 30.6917 70.3232 30.7266 69.5676C31.0869 61.6984 30.3314 43.9607 17.0803 37.6258L2.24849 31.8953L1.09775 35.3243C-2.63346 46.39 3.46898 58.2113 14.5231 61.9657C24.1359 65.232 27.5649 71.4274 25.2518 80.7147C25.1472 81.0518 23.4734 90.6181 23.7059 94.8607H34.3648C34.7251 88.2817 41.6296 83.9577 47.6158 86.6428C49.3012 87.3983 51.0332 88.4793 52.8116 89.8741C62.343 97.383 76.3845 95.6046 83.8818 86.0616L86.0205 83.3417L72.537 73.6591C63.2846 66.3827 50.9402 69.6722 41.804 75.9025C41.0368 76.4256 40.0604 75.5887 40.4905 74.7518C51.533 53.0853 65.8883 53.1318 71.5141 57.944C78.3373 63.779 88.6707 62.7329 94.4593 55.8866L96.1215 53.9222L86.4157 46.4133H86.4274Z";
const VIEWBOX_CENTER_X = 48.5;
const VIEWBOX_CENTER_Y = 47.5;
const VIEWBOX_HALF_SIZE = 48.5;

const HALF_DEPTH = 0.09;
const FACE_STEP = 0.012;
const EDGE_STEP = 0.008;
const DEPTH_STEP = 0.015;
const CAMERA_DISTANCE = 3.5;
const LIGHT = normalize({ x: -0.35, y: 0.45, z: -1 });
const AMBIENT = 0.12;

interface Point2 {
    x: number;
    y: number;
}

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface SurfacePoint {
    position: Vector3;
    normal: Vector3;
}

/** Lighting intensity in [0, 1] for each cell, or undefined where the logo does not cover the cell. */
export type LogoFrame = Array<Array<number | undefined>>;

let cachedSurface: SurfacePoint[] | undefined;

export function renderLogoFrame({
    angle,
    width,
    height,
    size = 0.92
}: {
    angle: number;
    width: number;
    height: number;
    /** Fraction of the grid the logo spans when facing forward. */
    size?: number;
}): LogoFrame {
    const frame: LogoFrame = Array.from({ length: height }, () => new Array<number | undefined>(width).fill(undefined));
    const depthBuffer: number[][] = Array.from({ length: height }, () => new Array<number>(width).fill(0));
    const tilt = 0.3 * Math.sin(angle);
    const rotate = (vector: Vector3): Vector3 => rotateX(rotateY(vector, angle), tilt);

    for (const point of getSurface()) {
        const position = rotate(point.position);
        const inverseDepth = 1 / (CAMERA_DISTANCE + position.z);
        const scale = CAMERA_DISTANCE * inverseDepth * size;
        const column = Math.floor(width / 2 + (width / 2) * position.x * scale);
        const row = Math.floor(height / 2 - (height / 2) * position.y * scale);
        const depthRow = depthBuffer[row];
        const frameRow = frame[row];
        if (depthRow === undefined || frameRow === undefined || column < 0 || column >= width) {
            continue;
        }
        if (inverseDepth <= (depthRow[column] ?? 0)) {
            continue;
        }
        depthRow[column] = inverseDepth;
        frameRow[column] = AMBIENT + (1 - AMBIENT) * Math.max(0, dot(rotate(point.normal), LIGHT));
    }
    return frame;
}

function getSurface(): SurfacePoint[] {
    cachedSurface ??= buildSurface(toLogoSpace(parsePath(FERN_LOGO_PATH)));
    return cachedSurface;
}

function buildSurface(polygon: Point2[]): SurfacePoint[] {
    const points: SurfacePoint[] = [];
    for (let y = -1; y <= 1; y += FACE_STEP) {
        for (let x = -1; x <= 1; x += FACE_STEP) {
            if (isInsidePolygon({ x, y }, polygon)) {
                points.push({ position: { x, y, z: -HALF_DEPTH }, normal: { x: 0, y: 0, z: -1 } });
                points.push({ position: { x, y, z: HALF_DEPTH }, normal: { x: 0, y: 0, z: 1 } });
            }
        }
    }

    const orientation = Math.sign(signedArea(polygon)) || 1;
    for (let index = 0; index < polygon.length; index++) {
        const start = polygon[index];
        const end = polygon[(index + 1) % polygon.length];
        if (start === undefined || end === undefined) {
            continue;
        }
        const length = Math.hypot(end.x - start.x, end.y - start.y);
        if (length === 0) {
            continue;
        }
        // Outward normal of a counter-clockwise edge is (dy, -dx); flip it for clockwise winding.
        const normal = {
            x: (orientation * (end.y - start.y)) / length,
            y: (orientation * -(end.x - start.x)) / length,
            z: 0
        };
        for (let distance = 0; distance < length; distance += EDGE_STEP) {
            const progress = distance / length;
            const x = start.x + (end.x - start.x) * progress;
            const y = start.y + (end.y - start.y) * progress;
            for (let z = -HALF_DEPTH; z <= HALF_DEPTH; z += DEPTH_STEP) {
                points.push({ position: { x, y, z }, normal });
            }
        }
    }
    return points;
}

/** Flattens an SVG path made of absolute M/L/H/V/C/Z commands into a polygon. */
export function parsePath(path: string): Point2[] {
    const tokens = path.match(/[a-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? [];
    const points: Point2[] = [];
    let index = 0;
    let command = "";
    let current: Point2 = { x: 0, y: 0 };
    const nextNumber = (): number => {
        const token = tokens[index++];
        const value = Number(token);
        if (token === undefined || Number.isNaN(value)) {
            throw new Error(`Expected a number in SVG path at token ${index - 1}`);
        }
        return value;
    };

    while (index < tokens.length) {
        const token = tokens[index] ?? "";
        if (/^[a-z]$/i.test(token)) {
            command = token;
            index++;
            if (command === "Z" || command === "z") {
                continue;
            }
        }
        switch (command) {
            case "M":
            case "L":
                current = { x: nextNumber(), y: nextNumber() };
                points.push(current);
                break;
            case "H":
                current = { x: nextNumber(), y: current.y };
                points.push(current);
                break;
            case "V":
                current = { x: current.x, y: nextNumber() };
                points.push(current);
                break;
            case "C": {
                const start = current;
                const control1 = { x: nextNumber(), y: nextNumber() };
                const control2 = { x: nextNumber(), y: nextNumber() };
                const end = { x: nextNumber(), y: nextNumber() };
                for (let step = 1; step <= 10; step++) {
                    points.push(cubicBezier(start, control1, control2, end, step / 10));
                }
                current = end;
                break;
            }
            default:
                throw new Error(`Unsupported SVG path command: ${command || token}`);
        }
    }
    return points;
}

function toLogoSpace(points: Point2[]): Point2[] {
    return points.map((point) => ({
        x: (point.x - VIEWBOX_CENTER_X) / VIEWBOX_HALF_SIZE,
        y: -(point.y - VIEWBOX_CENTER_Y) / VIEWBOX_HALF_SIZE
    }));
}

function cubicBezier(start: Point2, control1: Point2, control2: Point2, end: Point2, t: number): Point2 {
    const inverse = 1 - t;
    const a = inverse * inverse * inverse;
    const b = 3 * inverse * inverse * t;
    const c = 3 * inverse * t * t;
    const d = t * t * t;
    return {
        x: a * start.x + b * control1.x + c * control2.x + d * end.x,
        y: a * start.y + b * control1.y + c * control2.y + d * end.y
    };
}

function isInsidePolygon(point: Point2, polygon: Point2[]): boolean {
    let inside = false;
    for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
        const a = polygon[index];
        const b = polygon[previous];
        if (a === undefined || b === undefined) {
            continue;
        }
        if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
            inside = !inside;
        }
    }
    return inside;
}

function signedArea(polygon: Point2[]): number {
    let area = 0;
    for (let index = 0; index < polygon.length; index++) {
        const a = polygon[index];
        const b = polygon[(index + 1) % polygon.length];
        if (a !== undefined && b !== undefined) {
            area += a.x * b.y - b.x * a.y;
        }
    }
    return area / 2;
}

function rotateY(vector: Vector3, angle: number): Vector3 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: vector.x * cos + vector.z * sin, y: vector.y, z: -vector.x * sin + vector.z * cos };
}

function rotateX(vector: Vector3, angle: number): Vector3 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: vector.x, y: vector.y * cos - vector.z * sin, z: vector.y * sin + vector.z * cos };
}

function dot(left: Vector3, right: Vector3): number {
    return left.x * right.x + left.y * right.y + left.z * right.z;
}

function normalize(vector: Vector3): Vector3 {
    const length = Math.hypot(vector.x, vector.y, vector.z);
    return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}
