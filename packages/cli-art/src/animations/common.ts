import { CELL_ASPECT } from "../core/animation";
import { adjustLightness, mix, type Rgb } from "../core/color";
import { emptyFrame, type Frame, setCell } from "../core/frame";
import { logoColor, type Palette, resolvePalette } from "../palette";
import { type DepthCell, depthCells, type LogoCell, logoCells } from "../shapes/logo-cells";
import type { Shape } from "../shapes/shape";

/** Options every logo animation accepts. */
export interface LogoAnimationOptions {
    /** Grid width in cells. */
    width?: number;
    /** Grid height in cells. */
    height?: number;
    /** Character the logo is drawn with. Defaults to a full block. */
    glyph?: string;
    /** Colors, merged over a palette pulled from the logo's own colors. */
    palette?: Partial<Palette>;
}

export interface LogoModel {
    width: number;
    height: number;
    glyph: string;
    palette: Palette;
    face: LogoCell[];
    depth: DepthCell[];
}

export const DEFAULT_GLYPH = "█";
const MIN_WIDTH = 16;
const MAX_WIDTH = 80;

/**
 * Lays out a logo on a grid. Without a width, the grid is sized to the logo's proportions (plus room for
 * its extrusion), so wide wordmarks and square icons both fill it.
 */
export function buildLogoModel(shape: Shape, options: LogoAnimationOptions, defaults: { height: number }): LogoModel {
    const height = options.height ?? defaults.height;
    const fitted = Math.round(shape.aspectRatio * (height - 1) * CELL_ASPECT * 0.95) + 2;
    const width = options.width ?? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, fitted));
    const face = logoCells(shape, width, height);
    return {
        width,
        height,
        glyph: options.glyph ?? DEFAULT_GLYPH,
        palette: resolvePalette(shape, options.palette),
        face,
        depth: depthCells(face, width, height)
    };
}

/** The color of the logo's extruded sides. */
export function depthColor(palette: Palette, source: Rgb | undefined): Rgb {
    if (palette.logo !== undefined || source === undefined) {
        return palette.depth;
    }
    return mix(adjustLightness(source, -0.35), [0, 0, 0], 0.2);
}

/**
 * The finished, extruded logo, with a soft highlight sweeping across it once it has formed (for as long
 * as the animation keeps running).
 */
export function renderSettledLogo(model: LogoModel, framesSinceSettled: number): Frame {
    const frame = emptyFrame(model.width, model.height);
    for (const cell of model.depth) {
        setCell(frame, cell.row, cell.column, { char: model.glyph, color: depthColor(model.palette, cell.color) });
    }
    const sweep = (framesSinceSettled % 48) / 48;
    for (const cell of model.face) {
        const distance = Math.abs(cell.column / model.width - sweep);
        const intensity =
            framesSinceSettled === 0
                ? cell.intensity
                : Math.min(1, cell.intensity + 0.25 * Math.max(0, 1 - distance * 8));
        setCell(frame, cell.row, cell.column, {
            char: model.glyph,
            color: logoColor(model.palette, cell.color, intensity)
        });
    }
    return frame;
}
