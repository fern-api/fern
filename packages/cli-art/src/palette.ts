import { adjustLightness, gradient, luminance, mix, type Rgb, shade, toHsl, WHITE } from "./core/color";
import type { Shape } from "./shapes/shape";

/** The colors an animation draws with. Every field is optional when passed to an animation. */
export interface Palette {
    /**
     * Shading ramp for the logo, dark to bright. When set, the logo is drawn in this ramp instead of
     * its own colors.
     */
    logo?: Rgb[];
    /** The logo's extruded sides. */
    depth: Rgb;
    /** Light sweeping across the finished logo. */
    highlight: Rgb;
    /** The logo's own prominent colors, bright, for effects that should feel like part of the logo. */
    accents: Rgb[];
    /** Sparks cooling from hot (first) to dim (last). */
    spark: Rgb[];
    /** Glass orb rim, dark to bright. */
    glass: Rgb[];
    /** Loose iron filings, dark to bright. */
    filing: Rgb[];
}

/** The logo's most prominent colors, favoring saturated brand colors over near-white and near-black. */
export function dominantColors(shape: Shape, count = 3): Rgb[] {
    const buckets = new Map<string, { weight: number; red: number; green: number; blue: number }>();
    const steps = 48;
    for (let y = 0; y < steps; y++) {
        for (let x = 0; x < steps; x++) {
            const sample = shape.sample((x + 0.5) / steps, (y + 0.5) / steps);
            if (sample === undefined || sample.alpha < 0.5) {
                continue;
            }
            const [red, green, blue] = sample.color;
            const key = `${red >> 4}:${green >> 4}:${blue >> 4}`;
            const bucket = buckets.get(key) ?? { weight: 0, red: 0, green: 0, blue: 0 };
            bucket.weight += sample.alpha;
            bucket.red += red * sample.alpha;
            bucket.green += green * sample.alpha;
            bucket.blue += blue * sample.alpha;
            buckets.set(key, bucket);
        }
    }
    const colors = [...buckets.values()].map((bucket) => {
        const color: Rgb = [
            Math.round(bucket.red / bucket.weight),
            Math.round(bucket.green / bucket.weight),
            Math.round(bucket.blue / bucket.weight)
        ];
        const [, saturation, lightness] = toHsl(color);
        // Near-white and near-black are usually backgrounds or outlines, not the brand color.
        const extremity = lightness > 0.92 || lightness < 0.08 ? 0.15 : 1;
        return { color, score: bucket.weight * (0.35 + saturation) * extremity };
    });
    return colors
        .sort((left, right) => right.score - left.score)
        .slice(0, count)
        .map((entry) => entry.color);
}

/** A full palette built around one brand color. */
export function paletteFromColor(base: Rgb): Palette {
    const bright = luminance(base) < 0.45 ? adjustLightness(base, 0.2) : adjustLightness(base, 0.08);
    return {
        depth: mix(adjustLightness(base, -0.3), [0, 0, 0], 0.25),
        highlight: mix(bright, WHITE, 0.55),
        accents: [bright],
        spark: [mix(bright, WHITE, 0.75), bright, base, adjustLightness(base, -0.3)],
        glass: [mix(base, [10, 14, 20], 0.8), mix(base, WHITE, 0.55)],
        filing: [mix([58, 64, 62], base, 0.1), mix([196, 206, 200], base, 0.1)]
    };
}

/** A palette pulled from the logo's own colors. */
export function paletteFromShape(shape: Shape): Palette {
    const colors = dominantColors(shape, 4);
    const palette = paletteFromColor(colors[0] ?? [120, 200, 120]);
    if (colors.length < 2) {
        return palette;
    }
    // Ordered by hue, so a ramp through them reads as a gradient rather than jumping back and forth.
    const accents = [...colors]
        .sort((left, right) => toHsl(left)[0] - toHsl(right)[0])
        .map((color) => adjustLightness(color, 0.1));
    return { ...palette, accents };
}

/** Merges overrides into the palette derived from a shape. */
export function resolvePalette(shape: Shape | undefined, overrides: Partial<Palette> | undefined): Palette {
    const base = shape === undefined ? paletteFromColor([120, 200, 120]) : paletteFromShape(shape);
    return { ...base, ...overrides };
}

/**
 * The color of a logo cell at a lighting intensity (0 dark, 1 bright): the palette's logo ramp when
 * one is set, otherwise the cell's own color, shaded.
 */
export function logoColor(palette: Palette, source: Rgb | undefined, intensity: number): Rgb {
    if (palette.logo !== undefined && palette.logo.length > 0) {
        // A gamma below 1 keeps forward-facing surfaces vivid while edges stay dark.
        return gradient(palette.logo)(Math.max(0, intensity) ** 0.6);
    }
    // Faces (around 0.55 to 0.85) stay close to the logo's true color; only bevelled edges catch light.
    return shade(source ?? [200, 200, 200], 0.2 + 0.5 * Math.max(0, intensity));
}
