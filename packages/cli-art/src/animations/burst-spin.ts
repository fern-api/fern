import { type Animation, CELL_ASPECT } from "../core/animation";
import type { Rgb } from "../core/color";
import { type Cell, emptyFrame, type Frame, setCell } from "../core/frame";
import { clamp, easeInOutCubic } from "../core/math";
import { logoColor, type Palette, resolvePalette } from "../palette";
import type { Shape } from "../shapes/shape";
import { renderSolid, type SolidCell } from "../shapes/solid";
import { BURST_LANDED, type BurstTarget, burstFrames } from "./burst";
import type { LogoAnimationOptions } from "./common";

export interface BurstSpinOptions extends Omit<LogoAnimationOptions, "glyph"> {
    /** Frames per full turn. Defaults to 96 (about 3 seconds at 30 fps). */
    framesPerTurn?: number;
    /** Full turns after the burst lands. Defaults to 1. */
    turns?: number;
}

const SIZE = 0.94;
const MIN_WIDTH = 16;
const MAX_WIDTH = 80;
const RESOLUTION = 240;

/**
 * Sparks burst out of a single dot and land as the logo, which then turns once around its vertical
 * axis, in place, and comes to rest facing forward. Drawn in half-block pixels, two per cell, so fine
 * detail survives.
 */
export function burstSpin(shape: Shape, options: BurstSpinOptions = {}): Animation {
    // Sized to the logo, so wide wordmarks get a wide, short grid and icons a square one.
    const aspect = shape.aspectRatio;
    const maxHeight = options.height ?? 18;
    const width = options.width ?? clamp(Math.round(aspect * maxHeight * CELL_ASPECT * SIZE) + 2, MIN_WIDTH, MAX_WIDTH);
    const height = options.height ?? Math.min(maxHeight, Math.ceil(width / (aspect * CELL_ASPECT)) + 2);
    const framesPerTurn = options.framesPerTurn ?? 96;
    const spinFrames = framesPerTurn * Math.max(1, options.turns ?? 1);
    const palette = resolvePalette(shape, options.palette);
    const pixels = (angle: number) =>
        renderSolid({
            shape,
            angle,
            width,
            height,
            size: SIZE,
            fitShape: true,
            tilt: false,
            perspective: false,
            subRows: 2,
            resolution: RESOLUTION
        });

    // Sparks land exactly where the first turned frame draws, so the spin starts without a jump.
    const targets: BurstTarget[] = [];
    forEachCell(pixels(0), (row, column, top, bottom) => {
        targets.push({
            center: { x: ((column + 0.5) / width) * 2 - 1, y: 1 - ((row + 0.5) / height) * 2 },
            color: (top ?? bottom)?.color,
            land: (fade) => halfBlock(palette, top, bottom, fade)
        });
    });
    const burst = burstFrames(targets, { width, height, palette });
    const angleAt = (frame: number): number => {
        const spun = frame - BURST_LANDED;
        if (spun < spinFrames) {
            return 2 * Math.PI * (spinFrames / framesPerTurn) * easeInOutCubic(spun / spinFrames);
        }
        return (2 * Math.PI * spun) / framesPerTurn;
    };
    return {
        width,
        height,
        duration: BURST_LANDED + spinFrames,
        restFrame: BURST_LANDED,
        canStop: (frame) => frame >= BURST_LANDED && (frame - BURST_LANDED) % framesPerTurn === 0,
        render: (frame) => {
            if (frame < BURST_LANDED) {
                return burst(frame);
            }
            const grid: Frame = emptyFrame(width, height);
            forEachCell(pixels(angleAt(frame)), (row, column, top, bottom) =>
                setCell(grid, row, column, halfBlock(palette, top, bottom, 1))
            );
            return grid;
        }
    };
}

/** Pairs up pixel rows into cells, skipping cells with neither pixel set. */
function forEachCell(
    pixels: Array<Array<SolidCell | undefined>>,
    visit: (row: number, column: number, top: SolidCell | undefined, bottom: SolidCell | undefined) => void
): void {
    for (let row = 0; row * 2 < pixels.length; row++) {
        const upper = pixels[row * 2] ?? [];
        const lower = pixels[row * 2 + 1] ?? [];
        for (let column = 0; column < Math.max(upper.length, lower.length); column++) {
            const top = upper[column];
            const bottom = lower[column];
            if (top !== undefined || bottom !== undefined) {
                visit(row, column, top, bottom);
            }
        }
    }
}

/** One cell showing two lit pixels: the top as the glyph, the bottom as the background. */
function halfBlock(palette: Palette, top: SolidCell | undefined, bottom: SolidCell | undefined, fade: number): Cell {
    const shadeOf = (pixel: SolidCell): Rgb => logoColor(palette, pixel.color, pixel.intensity * fade);
    if (top === undefined) {
        return { char: "▄", color: bottom === undefined ? undefined : shadeOf(bottom) };
    }
    if (bottom === undefined) {
        return { char: "▀", color: shadeOf(top) };
    }
    const upper = shadeOf(top);
    const lower = shadeOf(bottom);
    return upper.every((channel, index) => channel === lower[index])
        ? { char: "█", color: upper }
        : { char: "▀", color: upper, background: lower };
}
