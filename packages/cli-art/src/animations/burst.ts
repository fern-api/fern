import type { Animation } from "../core/animation";
import { gradient, mix, type Rgb, WHITE } from "../core/color";
import { type Cell, emptyFrame, type Frame, plot } from "../core/frame";
import { clamp, easeInOutCubic, easeOutCubic, mulberry32, shuffle } from "../core/math";
import { logoColor } from "../palette";
import type { Shape } from "../shapes/shape";
import { buildLogoModel, type LogoAnimationOptions, renderSettledLogo } from "./common";

const DOT_END = 10;
const EXPLODE_END = 40;
const CONVERGE_END = 84;
const DECOY_RATIO = 0.4;
const MAX_STAGGER = 0.35;
const SWIRL = 2.4;
const DOT_GLYPHS = [".", ".", ":", ":", "o", "o", "O", "O", "@", "@"];
const SPARK_GLYPHS = "!#$%&*+=?@~^<>/\\|{}[];:01xX".split("");

/**
 * A single dot explodes into a spray of ASCII sparks, which swirl back in and land on the cells of the
 * logo.
 */
export function burst(shape: Shape, options: LogoAnimationOptions = {}): Animation {
    const model = buildLogoModel(shape, options, { height: 12 });
    const sparkColor = gradient(model.palette.spark);
    // A multi-color logo's sparks carry the color of where they land, so the burst shows its gradient.
    const accents =
        model.palette.accents.length > 1 && model.palette.logo === undefined
            ? gradient(model.palette.accents)
            : undefined;
    const random = mulberry32(0xfe7);
    const targets = shuffle(model.face, random);
    const particles = Array.from({ length: Math.round(targets.length * (1 + DECOY_RATIO)) }, (_, index) => {
        const angle = random() * 2 * Math.PI;
        const speed = 0.35 + random() * 0.8;
        return {
            burst: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
            target: targets[index],
            delay: random() * MAX_STAGGER,
            glyphSeed: Math.floor(random() * SPARK_GLYPHS.length),
            hue: accents === undefined ? undefined : (targets[index]?.color ?? accents(random()))
        };
    });
    const spark = (particle: { glyphSeed: number; hue: Rgb | undefined }, frame: number, heat: number): Cell => ({
        char: SPARK_GLYPHS[(particle.glyphSeed + Math.floor(frame / 3)) % SPARK_GLYPHS.length] ?? "*",
        color: particle.hue === undefined ? sparkColor(1 - heat) : sparkHue(particle.hue, heat),
        bold: heat > 0.7
    });

    return {
        width: model.width,
        height: model.height,
        duration: 96,
        restFrame: CONVERGE_END,
        canStop: (frame) => frame >= CONVERGE_END,
        render(frame): Frame {
            if (frame >= CONVERGE_END) {
                return renderSettledLogo(model, frame - CONVERGE_END);
            }
            const grid = emptyFrame(model.width, model.height);
            if (frame < DOT_END) {
                plot(grid, 0, 0, {
                    char: DOT_GLYPHS[frame] ?? "@",
                    color: sparkColor(0.5 - frame / (2 * DOT_END)),
                    bold: true
                });
                return grid;
            }
            const landed: Array<[number, number, Cell]> = [];
            for (const particle of particles) {
                if (frame < EXPLODE_END) {
                    const progress = easeOutCubic((frame - DOT_END) / (EXPLODE_END - DOT_END));
                    plot(
                        grid,
                        particle.burst.x * progress,
                        particle.burst.y * progress,
                        spark(particle, frame, 1 - 0.6 * progress)
                    );
                    continue;
                }
                const raw = (frame - EXPLODE_END) / (CONVERGE_END - EXPLODE_END);
                const progress = clamp((raw - particle.delay) / (1 - MAX_STAGGER));
                const target = particle.target;
                if (target === undefined) {
                    // Decoy sparks drift outward and burn out instead of landing.
                    if (progress < 0.6) {
                        const scale = 1 + progress * 0.5;
                        plot(
                            grid,
                            particle.burst.x * scale,
                            particle.burst.y * scale,
                            spark(particle, frame, 0.4 * (1 - progress / 0.6))
                        );
                    }
                    continue;
                }
                const eased = easeInOutCubic(progress);
                // Swirl around the center on the way in, unwinding as the particle lands.
                const swirl = SWIRL * (1 - eased);
                const x = particle.burst.x + (target.center.x - particle.burst.x) * eased;
                const y = particle.burst.y + (target.center.y - particle.burst.y) * eased;
                const point = {
                    x: x * Math.cos(swirl) - y * Math.sin(swirl),
                    y: x * Math.sin(swirl) + y * Math.cos(swirl)
                };
                if (progress >= 0.9) {
                    const intensity = target.intensity * clamp((progress - 0.9) * 10 + 0.4);
                    landed.push([
                        point.x,
                        point.y,
                        { char: model.glyph, color: logoColor(model.palette, target.color, intensity) }
                    ]);
                } else {
                    plot(grid, point.x, point.y, spark(particle, frame, 0.4 + 0.3 * eased));
                }
            }
            // Landed cells are drawn last so in-flight sparks never cover them.
            for (const [x, y, cell] of landed) {
                plot(grid, x, y, cell);
            }
            return grid;
        }
    };
}

/** A spark in a logo color: white hot, cooling to the color, then fading out. */
function sparkHue(color: Rgb, heat: number): Rgb {
    return heat > 0.6 ? mix(color, WHITE, (heat - 0.6) * 1.5) : mix(mix(color, [0, 0, 0], 0.6), color, heat / 0.6);
}
