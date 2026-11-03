import type { Animation } from "../core/animation";
import { mix, type Rgb } from "../core/color";
import { type Cell, emptyFrame, type Frame } from "../core/frame";
import { clamp, easeOutCubic, mulberry32, noise } from "../core/math";
import { logoColor, type Palette, resolvePalette } from "../palette";
import { rasterize } from "../shapes/raster";
import type { Shape } from "../shapes/shape";

export interface SkylineOptions {
    /** Scene width in cells, 60 to 80. Defaults to 76. */
    width?: number;
    /** Logo for the bottom-left corner. */
    logo?: Shape;
    /** Lines of large lettering beside the logo, for example a figlet-style wordmark. */
    wordmark?: string[];
    /** Text typed out in the bottom-right corner. */
    tagline?: string;
    /** Character the logo is drawn with. Defaults to a full block. */
    glyph?: string;
    palette?: Partial<Palette>;
}

export const SKYLINE_HEIGHT = 18;
export const SKYLINE_MIN_WIDTH = 60;
export const SKYLINE_MAX_WIDTH = 80;
const SETTLE_FRAME = 84;
const HORIZON_ROW = 8;
const TOP_RAIL_ROW = 8;
const BOTTOM_RAIL_ROW = 11;
const WATER_ROWS = [9, 10];
const FOOTER_TOP_ROW = 12;
const BALUSTER_SPACING = 4;
const LIT_SHARE = 0.75;
const LOGO_WIDTH = 14;
const LOGO_HEIGHT = 6;

// Landmark tops; ":" marks a window and spaces are transparent. The last row repeats down to the horizon.
const ONE_WORLD_TRADE = ["   |   ", "   |   ", "  /:\\  ", " /:::\\ ", " |:::| "];
const EMPIRE_STATE = ["   |   ", "  _|_  ", "  |:|  ", " _|:|_ ", " |:::| "];
const CHRYSLER = ["   ^   ", "  /:\\  ", "  |:|  ", " /:::\\ ", " |:::| "];

const BUILDING: Rgb = [86, 98, 130];
const WINDOW: Rgb = [44, 50, 72];
const CABLE: Rgb = [95, 100, 112];
const TAGLINE: Rgb = [235, 235, 235];

type StaticCell = { kind: "building" | "cable" | "rail"; char: string; intensity: number };

/**
 * The Manhattan skyline at night, seen through the walkway railing of the Brooklyn Bridge. Windows
 * light up across the city as it runs, stars twinkle, and the East River shimmers. An optional logo
 * and wordmark sit in the bottom left, with a tagline typed out in the bottom right.
 */
export function skyline(options: SkylineOptions = {}): Animation {
    const width = Math.min(SKYLINE_MAX_WIDTH, Math.max(SKYLINE_MIN_WIDTH, options.width ?? 76));
    const palette = resolvePalette(options.logo, options.palette);
    const layout = buildLayout(width);
    const logo = options.logo === undefined ? [] : footerLogo(options.logo, options.glyph ?? "█");
    const wordmark = options.wordmark ?? [];
    const tagline = options.tagline ?? "";

    return {
        width,
        height: SKYLINE_HEIGHT,
        duration: 96,
        restFrame: SETTLE_FRAME,
        canStop: (frame) => frame >= SETTLE_FRAME,
        render(frame): Frame {
            const scene = emptyFrame(width, SKYLINE_HEIGHT);
            const put = (row: number, column: number, cell: Cell): void => {
                const sceneRow = scene[row];
                if (sceneRow !== undefined && column >= 0 && column < width) {
                    sceneRow[column] = cell;
                }
            };
            layout.base.forEach((row, rowIndex) =>
                row.forEach((cell, column) => {
                    if (cell !== undefined) {
                        put(rowIndex, column, { char: cell.char, color: staticColor(cell) });
                    }
                })
            );

            // The city wakes up: windows switch on in a random order, and a few flicker afterwards.
            const awake = LIT_SHARE * easeOutCubic(frame / (SETTLE_FRAME - 12));
            const settled = frame >= SETTLE_FRAME;
            const litColumns = new Set<number>();
            layout.windows.forEach((window, index) => {
                const flicker = frame > SETTLE_FRAME && noise(index, Math.floor(frame / 8), 3) > 0.96;
                const lit = window.rank < awake !== flicker;
                if (lit) {
                    litColumns.add(window.column);
                }
                const glow = 0.75 + 0.25 * noise(index, settled ? 0 : Math.floor(frame / 6), 4);
                put(
                    window.row,
                    window.column,
                    lit
                        ? { char: "#", color: mix([200, 150, 60], [255, 224, 140], glow) }
                        : { char: ".", color: WINDOW }
                );
            });

            layout.stars.forEach((star, index) => {
                const twinkle = noise(index, Math.floor(frame / 5), 5);
                put(star.row, star.column, {
                    char: twinkle > 0.75 ? "*" : twinkle > 0.3 ? "+" : ".",
                    color: mix([90, 100, 140], [230, 235, 255], 0.4 + 0.6 * clamp(twinkle))
                });
            });

            // The East River: drifting ripples, with warm reflections under lit buildings.
            for (const row of WATER_ROWS) {
                for (let column = 0; column < width; column++) {
                    if (layout.base[row]?.[column]?.kind === "rail") {
                        continue;
                    }
                    const ripple = (column + Math.floor(frame / 4) + row * 3) % 5 === 0;
                    const reflection = litColumns.has(column) && noise(column, Math.floor(frame / 3), row) > -0.3;
                    put(
                        row,
                        column,
                        reflection
                            ? {
                                  char: ripple ? "~" : "-",
                                  color: mix([120, 90, 40], [230, 180, 90], 0.5 + 0.3 * noise(column, frame, 6))
                              }
                            : { char: ripple ? "-" : "~", color: mix([20, 48, 95], [70, 125, 200], ripple ? 0.7 : 0.4) }
                    );
                }
            }

            // Footer: the logo fades in, the wordmark reveals left to right, then the tagline types out.
            const fade = clamp(frame / 24);
            if (fade > 0) {
                for (const cell of logo) {
                    put(cell.row, 1 + cell.column, {
                        char: cell.char,
                        color: logoColor(palette, cell.color, cell.intensity * fade)
                    });
                }
            }
            const wordmarkLeft = logo.length > 0 ? LOGO_WIDTH + 3 : 1;
            const wordmarkColumns = Math.floor(
                clamp((frame - 8) / 30) * Math.max(0, ...wordmark.map((line) => line.length))
            );
            const wordmarkTop = SKYLINE_HEIGHT - wordmark.length;
            const wordmarkColor = logoColor(palette, logo[0]?.color, 1);
            wordmark.forEach((line, offset) => {
                for (let index = 0; index < Math.min(wordmarkColumns, line.length); index++) {
                    const char = line[index] ?? " ";
                    if (char !== " ") {
                        put(wordmarkTop + offset, wordmarkLeft + index, { char, color: wordmarkColor, bold: true });
                    }
                }
            });
            const typed = Math.floor(clamp((frame - 40) / 32) * tagline.length);
            for (let index = 0; index < typed; index++) {
                const char = tagline[index] ?? " ";
                if (char !== " ") {
                    put(SKYLINE_HEIGHT - 1, width - tagline.length - 1 + index, { char, color: TAGLINE, bold: true });
                }
            }
            return scene;
        }
    };
}

function staticColor(cell: StaticCell): Rgb {
    switch (cell.kind) {
        case "building":
            return BUILDING;
        case "cable":
            return CABLE;
        case "rail":
            return mix([90, 84, 78], [170, 160, 148], cell.intensity);
        default: {
            const unknown: never = cell.kind;
            throw new Error(`Unknown skyline cell: ${String(unknown)}`);
        }
    }
}

function footerLogo(
    shape: Shape,
    glyph: string
): Array<{ row: number; column: number; char: string; color: Rgb | undefined; intensity: number }> {
    const cells: Array<{ row: number; column: number; char: string; color: Rgb | undefined; intensity: number }> = [];
    rasterize(shape, { width: LOGO_WIDTH, height: LOGO_HEIGHT, size: 0.98 }).forEach((row, rowIndex) =>
        row.forEach((cell, column) => {
            if (cell.coverage >= 0.4) {
                cells.push({
                    row: FOOTER_TOP_ROW + rowIndex,
                    column,
                    char: glyph,
                    color: cell.color,
                    intensity: 0.7 + 0.3 * cell.coverage
                });
            }
        })
    );
    return cells;
}

interface Layout {
    base: Array<Array<StaticCell | undefined>>;
    windows: Array<{ row: number; column: number; rank: number }>;
    stars: Array<{ row: number; column: number }>;
}

function buildLayout(width: number): Layout {
    const random = mulberry32(0xb4006);
    const base: Array<Array<StaticCell | undefined>> = Array.from({ length: SKYLINE_HEIGHT }, () =>
        new Array<StaticCell | undefined>(width).fill(undefined)
    );
    const windowCells: Array<{ row: number; column: number }> = [];
    const put = (row: number, column: number, char: string): void => {
        const baseRow = base[row];
        if (baseRow === undefined || column < 0 || column >= width || char === " ") {
            return;
        }
        if (char === ":") {
            baseRow[column] = undefined;
            windowCells.push({ row, column });
        } else {
            baseRow[column] = { kind: "building", char, intensity: 0.6 };
        }
    };
    const drawTemplate = (template: string[], left: number, top: number): void => {
        const lastRow = template[template.length - 1] ?? "";
        for (let row = top; row <= HORIZON_ROW; row++) {
            [...(template[row - top] ?? lastRow)].forEach((char, offset) => put(row, left + offset, char));
        }
    };

    // Background blocks first, then the landmarks in front of them.
    let column = 0;
    while (column < width) {
        const blockWidth = 3 + Math.floor(random() * 4);
        const top = 2 + Math.floor(random() * 5);
        drawTemplate([`.${"-".repeat(blockWidth - 2)}.`, `|${":".repeat(blockWidth - 2)}|`], column, top);
        column += blockWidth + Math.floor(random() * 2);
    }
    drawTemplate(ONE_WORLD_TRADE, Math.round(width * 0.16), 0);
    drawTemplate(EMPIRE_STATE, Math.round(width * 0.5), 1);
    drawTemplate(CHRYSLER, Math.round(width * 0.66), 1);

    // Bridge cables cross the open sky in a diamond lattice, stopping where the skyline begins.
    const windowSet = new Set(windowCells.map((cell) => `${cell.row}:${cell.column}`));
    const skylineTop = Array.from({ length: width }, (_, skyColumn) => {
        for (let row = 0; row <= HORIZON_ROW; row++) {
            if (base[row]?.[skyColumn] !== undefined || windowSet.has(`${row}:${skyColumn}`)) {
                return row;
            }
        }
        return HORIZON_ROW;
    });
    for (let start = -width; start < width * 2; start += 14) {
        for (let row = 0; row < TOP_RAIL_ROW; row++) {
            for (const [direction, char] of [
                [1, "\\"],
                [-1, "/"]
            ] as const) {
                const cableColumn = start + direction * row * 2;
                const baseRow = base[row];
                if (
                    baseRow !== undefined &&
                    cableColumn >= 0 &&
                    cableColumn < width &&
                    row < (skylineTop[cableColumn] ?? 0)
                ) {
                    baseRow[cableColumn] = { kind: "cable", char, intensity: 0.5 };
                }
            }
        }
    }

    // The walkway railing in the foreground: two rails with balusters between them.
    for (let railColumn = 0; railColumn < width; railColumn++) {
        for (const row of [TOP_RAIL_ROW, BOTTOM_RAIL_ROW]) {
            const baseRow = base[row];
            if (baseRow !== undefined) {
                baseRow[railColumn] = { kind: "rail", char: "=", intensity: 0.8 };
            }
        }
        if (railColumn % BALUSTER_SPACING === 1) {
            for (let row = TOP_RAIL_ROW + 1; row < BOTTOM_RAIL_ROW; row++) {
                const baseRow = base[row];
                if (baseRow !== undefined) {
                    baseRow[railColumn] = { kind: "rail", char: "|", intensity: 0.7 };
                }
            }
        }
    }

    // Keep each window once, and drop windows covered by a wall or the railing.
    const seen = new Set<string>();
    const windows = windowCells
        .filter((cell) => {
            const key = `${cell.row}:${cell.column}`;
            const visible = !seen.has(key) && base[cell.row]?.[cell.column] === undefined;
            seen.add(key);
            return visible;
        })
        .map((cell) => ({ ...cell, rank: random() }));

    const stars: Array<{ row: number; column: number }> = [];
    for (let index = 0; index < Math.round(width / 4); index++) {
        const row = Math.floor(random() * 3);
        const starColumn = Math.floor(random() * width);
        if (base[row]?.[starColumn] === undefined) {
            stars.push({ row, column: starColumn });
        }
    }
    return { base, windows, stars };
}
