import type { Animation } from "../core/animation";
import { gradient, mix, WHITE } from "../core/color";
import { emptyFrame, type Frame, setCell } from "../core/frame";
import { clamp } from "../core/math";
import { logoColor } from "../palette";
import type { Shape } from "../shapes/shape";
import { buildLogoModel, depthColor, type LogoAnimationOptions, renderSettledLogo } from "./common";

const WIPE_END = 40;
const REST_FRAME = 60;
/** How far behind the wipe front each cell finishes, as a share of the wipe. */
const EDGE_WIDTH = 0.12;
const EDGE_GLYPHS = ["░", "▒", "▓"];
/** The extruded depth trails the face slightly. */
const DEPTH_LAG = 0.06;

/**
 * Draws a logo in with a diagonal wipe of light: the leading edge glows as shaded blocks (░ ▒ ▓) in a
 * ramp through the logo's own colors, settling into those colors with a bevel and an extruded drop. A
 * soft highlight then sweeps across the finished logo for as long as it keeps running.
 */
export function reveal(shape: Shape, options: LogoAnimationOptions = {}): Animation {
    const model = buildLogoModel(shape, options, { height: 10 });
    const reach = (row: number, column: number): number => (column / model.width) * 0.85 + (row / model.height) * 0.15;
    // The leading edge glows in the logo's own colors, top to bottom, washed toward white.
    const glow = gradient(model.palette.accents.map((color) => mix(color, WHITE, 0.35)));

    return {
        width: model.width,
        height: model.height,
        duration: 72,
        restFrame: REST_FRAME,
        canStop: (frame) => frame >= REST_FRAME,
        render(frame): Frame {
            if (frame >= WIPE_END) {
                return renderSettledLogo(model, frame >= REST_FRAME ? frame - REST_FRAME : 0);
            }
            const front = (frame / WIPE_END) * (1 + EDGE_WIDTH + DEPTH_LAG);
            const grid = emptyFrame(model.width, model.height);
            for (const cell of model.depth) {
                const behind = front - DEPTH_LAG - reach(cell.row, cell.column);
                if (behind > EDGE_WIDTH) {
                    setCell(grid, cell.row, cell.column, {
                        char: model.glyph,
                        color: depthColor(model.palette, cell.color)
                    });
                }
            }
            for (const cell of model.face) {
                const behind = front - reach(cell.row, cell.column);
                if (behind <= 0) {
                    continue;
                }
                const settled = logoColor(model.palette, cell.color, cell.intensity);
                if (behind >= EDGE_WIDTH) {
                    setCell(grid, cell.row, cell.column, { char: model.glyph, color: settled });
                    continue;
                }
                // At the wipe's leading edge: light shaded blocks, fading from the glow into the logo's color.
                const progress = clamp(behind / EDGE_WIDTH);
                setCell(grid, cell.row, cell.column, {
                    char:
                        EDGE_GLYPHS[Math.min(EDGE_GLYPHS.length - 1, Math.floor(progress * EDGE_GLYPHS.length))] ?? "▓",
                    color: mix(glow(cell.row / Math.max(1, model.height - 1)), settled, progress),
                    bold: true
                });
            }
            return grid;
        }
    };
}
