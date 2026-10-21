import type { Rgb } from "./color";

/** One character cell of terminal art. */
export interface Cell {
    char: string;
    color?: Rgb;
    bold?: boolean;
}

/** A grid of cells, rows top to bottom; `undefined` cells are blank. */
export type Frame = Array<Array<Cell | undefined>>;

export type ColorMode = "truecolor" | "256" | "none";

export function emptyFrame(width: number, height: number): Frame {
    return Array.from({ length: height }, () => new Array<Cell | undefined>(width).fill(undefined));
}

/** Sets a cell, ignoring positions outside the frame. */
export function setCell(frame: Frame, row: number, column: number, cell: Cell): void {
    const frameRow = frame[row];
    if (frameRow !== undefined && column >= 0 && column < frameRow.length) {
        frameRow[column] = cell;
    }
}

/**
 * Writes a cell at a point in [-1, 1] coordinates (x right, y up) spanning the whole frame, ignoring
 * points that fall outside it.
 */
export function plot(frame: Frame, x: number, y: number, cell: Cell): void {
    const width = frame[0]?.length ?? 0;
    setCell(frame, Math.floor(((1 - y) / 2) * frame.length), Math.floor(((x + 1) / 2) * width), cell);
}

/**
 * How much color the stream supports, following the usual conventions: NO_COLOR and FORCE_COLOR,
 * then COLORTERM and TERM.
 */
export function detectColorMode(
    stream: { isTTY?: boolean } = process.stdout,
    env: Record<string, string | undefined> = process.env
): ColorMode {
    if (env.NO_COLOR !== undefined && env.NO_COLOR !== "") {
        return "none";
    }
    const forced = env.FORCE_COLOR;
    if (forced !== undefined) {
        if (forced === "0" || forced === "false") {
            return "none";
        }
        if (forced === "1" || forced === "2") {
            return "256";
        }
        return "truecolor";
    }
    if (stream.isTTY !== true || env.TERM === "dumb") {
        return "none";
    }
    if (env.COLORTERM === "truecolor" || env.COLORTERM === "24bit") {
        return "truecolor";
    }
    return env.TERM?.includes("256") === true ? "256" : "truecolor";
}

/** Renders a frame to one string per row, with ANSI colors for the given mode. */
export function frameToLines(frame: Frame, mode: ColorMode): string[] {
    return frame.map((row) => {
        let line = "";
        let open = false;
        for (const cell of row) {
            if (cell === undefined) {
                if (open) {
                    line += RESET;
                    open = false;
                }
                line += " ";
                continue;
            }
            if (mode === "none") {
                line += cell.char;
                continue;
            }
            line += `${style(cell, mode)}${cell.char}`;
            open = true;
        }
        return open ? `${line}${RESET}` : line;
    });
}

/** The frame as plain characters, for tests and logs. */
export function frameToText(frame: Frame): string[] {
    return frame.map((row) => row.map((cell) => cell?.char ?? " ").join(""));
}

const RESET = "\u001B[0m";

function style(cell: Cell, mode: Exclude<ColorMode, "none">): string {
    const bold = cell.bold === true ? "\u001B[1m" : "\u001B[22m";
    if (cell.color === undefined) {
        return `${bold}\u001B[39m`;
    }
    const [red, green, blue] = cell.color;
    return mode === "truecolor"
        ? `${bold}\u001B[38;2;${red};${green};${blue}m`
        : `${bold}\u001B[38;5;${toAnsi256(cell.color)}m`;
}

/** The closest color in the xterm 256-color cube or grayscale ramp. */
function toAnsi256([red, green, blue]: Rgb): number {
    if (red === green && green === blue) {
        if (red < 8) {
            return 16;
        }
        if (red > 248) {
            return 231;
        }
        return Math.round(((red - 8) / 247) * 24) + 232;
    }
    const level = (channel: number): number => Math.round((channel / 255) * 5);
    return 16 + 36 * level(red) + 6 * level(green) + level(blue);
}
