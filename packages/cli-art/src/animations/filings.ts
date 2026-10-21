import type { Animation } from "../core/animation";
import { gradient } from "../core/color";
import { type Cell, emptyFrame, type Frame, plot } from "../core/frame";
import { easeInOutCubic, mulberry32, noise, shuffle } from "../core/math";
import { logoColor } from "../palette";
import type { Shape } from "../shapes/shape";
import { buildLogoModel, type LogoAnimationOptions, renderSettledLogo } from "./common";

/** Frame windows during which the paper is shaken. */
const SHAKES: Array<[number, number]> = [
    [12, 24],
    [30, 42],
    [48, 60],
    [66, 78]
];
/** How far each filing has travelled toward the logo after each shake. */
const SHAKE_PROGRESS = [0.3, 0.6, 0.85, 1];
const SETTLE_FRAME = 84;
const STRAY_RATIO = 0.5;
const SCATTERED_GLYPHS = "-/|\\.,'`".split("");
const ALIGNED_GLYPHS = ["-", "/", "|", "\\"];

/**
 * Iron filings scattered across paper. Each time the paper is shaken they jitter, then creep toward
 * the logo as if a magnet sat underneath, lining up along the pull. Filings that lock into place take
 * the logo's color; the leftovers are shaken off the edges.
 */
export function filings(shape: Shape, options: LogoAnimationOptions = {}): Animation {
    const model = buildLogoModel(shape, options, { height: 12 });
    const steel = gradient(model.palette.filing);
    const random = mulberry32(0xf111);
    const targets = shuffle(model.face, random);
    const pieces = Array.from({ length: Math.round(targets.length * (1 + STRAY_RATIO)) }, (_, index) => ({
        start: { x: random() * 1.9 - 0.95, y: random() * 1.9 - 0.95 },
        target: targets[index],
        pull: 0.75 + random() * 0.5,
        scatteredGlyph: SCATTERED_GLYPHS[Math.floor(random() * SCATTERED_GLYPHS.length)] ?? "."
    }));

    return {
        width: model.width,
        height: model.height,
        duration: 96,
        restFrame: SETTLE_FRAME,
        canStop: (frame) => frame >= SETTLE_FRAME,
        render(frame): Frame {
            if (frame >= SETTLE_FRAME) {
                return renderSettledLogo(model, frame - SETTLE_FRAME);
            }
            const grid = emptyFrame(model.width, model.height);
            const shake = shakeAmplitude(frame);
            // The whole sheet of paper moves a little while it is being shaken.
            const paper = { x: noise(0, frame, 7) * 0.06 * shake, y: noise(0, frame, 8) * 0.08 * shake };
            const aligned = frame >= (SHAKES[0]?.[0] ?? 0);
            const filing = (char: string, brightness: number): Cell => ({ char, color: steel(brightness) });
            const locked: Array<[number, number, Cell]> = [];

            pieces.forEach((piece, index) => {
                const jitter = { x: noise(index, frame) * 0.07 * shake, y: noise(index, frame, 1) * 0.13 * shake };
                if (piece.target === undefined) {
                    // Strays are shaken toward the nearest edge and fall off the paper.
                    const progress = stagedProgress(frame, 1);
                    if (progress >= 1) {
                        return;
                    }
                    const length = Math.hypot(piece.start.x, piece.start.y) || 1;
                    const push = progress * 1.2;
                    plot(
                        grid,
                        piece.start.x + (piece.start.x / length) * push + jitter.x + paper.x,
                        piece.start.y + (piece.start.y / length) * push + jitter.y + paper.y,
                        filing(
                            aligned ? alignedGlyph(piece.start.x, piece.start.y) : piece.scatteredGlyph,
                            0.4 * (1 - progress) + 0.2 * shake
                        )
                    );
                    return;
                }
                const target = piece.target;
                const progress = stagedProgress(frame, piece.pull);
                const x = piece.start.x + (target.center.x - piece.start.x) * progress + jitter.x + paper.x;
                const y = piece.start.y + (target.center.y - piece.start.y) * progress + jitter.y + paper.y;
                if (progress >= 0.97) {
                    locked.push([
                        x,
                        y,
                        { char: model.glyph, color: logoColor(model.palette, target.color, target.intensity) }
                    ]);
                    return;
                }
                let glyph = piece.scatteredGlyph;
                if (shake > 0.2) {
                    glyph = ALIGNED_GLYPHS[Math.floor((noise(index, frame, 2) + 1) * 2) % ALIGNED_GLYPHS.length] ?? "-";
                } else if (aligned) {
                    glyph = alignedGlyph(target.center.x - x, target.center.y - y);
                }
                plot(grid, x, y, filing(glyph, 0.35 + 0.35 * progress + 0.2 * shake));
            });
            // Locked-in cells are drawn last so loose filings never cover them.
            for (const [x, y, cell] of locked) {
                plot(grid, x, y, cell);
            }
            return grid;
        }
    };
}

/** 0 between shakes, rising to 1 in the middle of a shake. */
function shakeAmplitude(frame: number): number {
    for (const [start, end] of SHAKES) {
        if (frame >= start && frame < end) {
            return Math.sin((Math.PI * (frame - start)) / (end - start));
        }
    }
    return 0;
}

/** How far a filing has moved toward its target: it only moves while the paper is being shaken. */
function stagedProgress(frame: number, pull: number): number {
    let level = 0;
    for (const [index, [start, end]] of SHAKES.entries()) {
        const next = index === SHAKES.length - 1 ? 1 : Math.min(1, (SHAKE_PROGRESS[index] ?? 1) * pull);
        if (frame < start) {
            return level;
        }
        if (frame < end) {
            return level + (next - level) * easeInOutCubic((frame - start) / (end - start));
        }
        level = next;
    }
    return level;
}

/** The filing stroke that best matches a direction (y up). */
function alignedGlyph(dx: number, dy: number): string {
    const angle = ((Math.atan2(dy, dx) % Math.PI) + Math.PI) % Math.PI;
    return ALIGNED_GLYPHS[Math.round(angle / (Math.PI / 4)) % ALIGNED_GLYPHS.length] ?? "-";
}
