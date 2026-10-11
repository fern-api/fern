import { renderLogoFrame } from "./logo";

// The orb is a glass sphere: mostly transparent, glowing at the rim, with a specular glint and faint
// latitude/longitude lines that turn with the logo spinning inside it.

const ORB_RADIUS = 0.97;
const LOGO_SIZE = 0.66;
const LIGHT = normalize({ x: -0.55, y: 0.6, z: -0.6 });
const MERIDIANS = 8;
const PARALLELS = 6;
const LINE_WIDTH = 0.07;

export type OrbLayer = "logo" | "rim" | "grid" | "glint";

export interface OrbCell {
    layer: OrbLayer;
    /** Intensity in [0, 1]. */
    intensity: number;
}

export type OrbFrame = Array<Array<OrbCell | undefined>>;

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export function renderOrbFrame({ angle, width, height }: { angle: number; width: number; height: number }): OrbFrame {
    const logo = renderLogoFrame({ angle, width, height, size: LOGO_SIZE });
    return Array.from({ length: height }, (_, row) =>
        Array.from({ length: width }, (_, column): OrbCell | undefined => {
            // Cell centers in [-1, 1]; terminal cells are about twice as tall as wide, as is the grid.
            const x = (column + 0.5 - width / 2) / (width / 2) / ORB_RADIUS;
            const y = (height / 2 - row - 0.5) / (height / 2) / ORB_RADIUS;
            const radiusSquared = x * x + y * y;
            if (radiusSquared > 1) {
                return undefined;
            }
            const normal = { x, y, z: -Math.sqrt(1 - radiusSquared) };
            const glint = Math.max(0, dot(normal, LIGHT)) ** 120;
            if (glint > 0.5) {
                return { layer: "glint", intensity: glint };
            }
            const logoIntensity = logo[row]?.[column];
            if (logoIntensity !== undefined) {
                return { layer: "logo", intensity: logoIntensity };
            }
            const fresnel = (1 + normal.z) ** 3;
            if (fresnel > 0.12) {
                return { layer: "rim", intensity: Math.min(1, fresnel) };
            }
            if (isOnGridLine(normal, angle)) {
                // Lines facing the light read slightly brighter than those on the shadowed side.
                return { layer: "grid", intensity: 0.35 + 0.4 * Math.max(0, dot(normal, LIGHT)) };
            }
            return undefined;
        })
    );
}

function isOnGridLine(normal: Vector3, angle: number): boolean {
    // Rotate the surface point back into the orb's own frame so the lines turn with the logo.
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const local = { x: normal.x * cos + normal.z * sin, y: normal.y, z: -normal.x * sin + normal.z * cos };
    const longitude = Math.atan2(local.x, local.z) / (2 * Math.PI);
    const latitude = Math.asin(Math.max(-1, Math.min(1, local.y))) / Math.PI;
    return distanceToStep(longitude * MERIDIANS) < LINE_WIDTH || distanceToStep(latitude * PARALLELS) < LINE_WIDTH;
}

function distanceToStep(value: number): number {
    return Math.abs(value - Math.round(value));
}

function dot(left: Vector3, right: Vector3): number {
    return left.x * right.x + left.y * right.y + left.z * right.z;
}

function normalize(vector: Vector3): Vector3 {
    const length = Math.hypot(vector.x, vector.y, vector.z);
    return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}
