import type { Animation } from "../core/animation";
import { gradient, mix, WHITE } from "../core/color";
import { type Cell, type Frame, setCell } from "../core/frame";
import { dot, normalize, type Vector3 } from "../core/math";
import { resolvePalette } from "../palette";
import type { Shape } from "../shapes/shape";
import type { SpinOptions } from "./spin";
import { renderSpinningShape } from "./spin";

const ORB_RADIUS = 0.97;
const LOGO_SIZE = 0.66;
const LIGHT = normalize({ x: -0.55, y: 0.6, z: -0.6 });
const MERIDIANS = 8;
const PARALLELS = 6;
const LINE_WIDTH = 0.07;

/**
 * The logo spinning in 3D inside a glass orb: mostly transparent glass that glows at the rim, with a
 * specular glint and faint latitude and longitude lines that turn with the logo.
 */
export function orb(shape: Shape, options: SpinOptions = {}): Animation {
    const width = options.width ?? 34;
    const height = options.height ?? 15;
    const framesPerTurn = options.framesPerTurn ?? 96;
    const palette = resolvePalette(shape, options.palette);
    const glass = gradient(palette.glass);
    return {
        width,
        height,
        duration: framesPerTurn,
        restFrame: 0,
        canStop: (frame) => frame % framesPerTurn === 0,
        render(frame): Frame {
            const angle = (2 * Math.PI * frame) / framesPerTurn;
            const logo = renderSpinningShape(shape, palette, {
                width,
                height,
                angle,
                size: LOGO_SIZE,
                glyph: options.glyph
            });
            const result: Frame = logo.map((row) => row.map(() => undefined));
            for (let row = 0; row < height; row++) {
                for (let column = 0; column < width; column++) {
                    // The grid is sized so the orb is round on screen: x and y both span [-1, 1].
                    const x = (column + 0.5 - width / 2) / (width / 2) / ORB_RADIUS;
                    const y = (height / 2 - row - 0.5) / (height / 2) / ORB_RADIUS;
                    const radiusSquared = x * x + y * y;
                    if (radiusSquared > 1) {
                        continue;
                    }
                    const normal = { x, y, z: -Math.sqrt(1 - radiusSquared) };
                    const cell = orbCell(normal, angle, logo[row]?.[column], glass);
                    if (cell !== undefined) {
                        setCell(result, row, column, cell);
                    }
                }
            }
            return result;
        }
    };
}

function orbCell(
    normal: Vector3,
    angle: number,
    logo: Cell | undefined,
    glass: (t: number) => readonly [number, number, number]
): Cell | undefined {
    const glint = Math.max(0, dot(normal, LIGHT)) ** 120;
    if (glint > 0.5) {
        return { char: "*", color: mix(WHITE, glass(1), 0.15), bold: true };
    }
    if (logo !== undefined) {
        return logo;
    }
    const fresnel = (1 + normal.z) ** 3;
    if (fresnel > 0.12) {
        const intensity = Math.min(1, fresnel);
        let char = "O";
        if (intensity < 0.3) {
            char = ".";
        } else if (intensity < 0.55) {
            char = ":";
        } else if (intensity < 0.8) {
            char = "o";
        }
        return { char, color: glass(intensity) };
    }
    if (isOnGridLine(normal, angle)) {
        return { char: "·", color: glass((0.35 + 0.4 * Math.max(0, dot(normal, LIGHT))) * 0.6) };
    }
    return undefined;
}

function isOnGridLine(normal: Vector3, angle: number): boolean {
    // Rotate the surface point back into the orb's own frame so the lines turn with the logo.
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const local = { x: normal.x * cos + normal.z * sin, y: normal.y, z: -normal.x * sin + normal.z * cos };
    const longitude = Math.atan2(local.x, local.z) / (2 * Math.PI);
    const latitude = Math.asin(Math.max(-1, Math.min(1, local.y))) / Math.PI;
    const distanceToStep = (value: number): number => Math.abs(value - Math.round(value));
    return distanceToStep(longitude * MERIDIANS) < LINE_WIDTH || distanceToStep(latitude * PARALLELS) < LINE_WIDTH;
}
