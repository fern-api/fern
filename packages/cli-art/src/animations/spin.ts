import type { Animation } from "../core/animation";
import { type Cell, emptyFrame, type Frame, setCell } from "../core/frame";
import { logoColor, type Palette, resolvePalette } from "../palette";
import type { Shape } from "../shapes/shape";
import { renderSolid } from "../shapes/solid";
import type { LogoAnimationOptions } from "./common";

export interface SpinOptions extends LogoAnimationOptions {
    /** Frames per full turn. Defaults to 96 (about 3 seconds at 30 fps). */
    framesPerTurn?: number;
}

/** The logo as an extruded 3D solid, turning slowly and coming to rest facing forward. */
export function spin(shape: Shape, options: SpinOptions = {}): Animation {
    const width = options.width ?? 34;
    const height = options.height ?? 15;
    const framesPerTurn = options.framesPerTurn ?? 96;
    const palette = resolvePalette(shape, options.palette);
    return {
        width,
        height,
        duration: framesPerTurn,
        restFrame: 0,
        canStop: (frame) => frame % framesPerTurn === 0,
        render: (frame) =>
            renderSpinningShape(shape, palette, {
                width,
                height,
                angle: (2 * Math.PI * frame) / framesPerTurn,
                size: 0.92,
                glyph: options.glyph
            })
    };
}

/** One frame of the spinning solid, shaded with the palette. */
export function renderSpinningShape(
    shape: Shape,
    palette: Palette,
    {
        width,
        height,
        angle,
        size,
        glyph
    }: { width: number; height: number; angle: number; size: number; glyph?: string }
): Frame {
    const frame = emptyFrame(width, height);
    renderSolid({ shape, angle, width, height, size }).forEach((row, rowIndex) =>
        row.forEach((cell, column) => {
            if (cell !== undefined) {
                setCell(frame, rowIndex, column, solidCell(palette, cell.intensity, cell.color, glyph));
            }
        })
    );
    return frame;
}

/**
 * Brighter surfaces get heavier glyphs, so the shape reads as 3D even without color: shaded blocks by
 * default, or `.` `:` and the given glyph (upper-cased in full light) when one is set.
 */
export function solidCell(palette: Palette, intensity: number, color: Cell["color"], glyph?: string): Cell {
    const ramp = glyph === undefined ? ["░", "▒", "▓", "█"] : [".", ":", glyph, glyph.toUpperCase()];
    let char = ramp[3] ?? "█";
    if (intensity < 0.3) {
        char = ramp[0] ?? ".";
    } else if (intensity < 0.5) {
        char = ramp[1] ?? ":";
    } else if (intensity < 0.93) {
        char = ramp[2] ?? "f";
    }
    return { char, color: logoColor(palette, color, intensity) };
}
