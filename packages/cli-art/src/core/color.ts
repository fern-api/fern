/** An sRGB color with 0–255 channels. */
export type Rgb = readonly [number, number, number];

export const BLACK: Rgb = [0, 0, 0];
export const WHITE: Rgb = [255, 255, 255];

/** Parses `#rgb`, `#rrggbb`, `rgb(r, g, b)`, or a few common color names. */
export function parseColor(value: string): Rgb | undefined {
    const text = value.trim().toLowerCase();
    const named = NAMED_COLORS[text];
    if (named !== undefined) {
        return named;
    }
    const short = text.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
    if (short !== null) {
        return [
            hexByte(`${short[1]}${short[1]}`),
            hexByte(`${short[2]}${short[2]}`),
            hexByte(`${short[3]}${short[3]}`)
        ];
    }
    const long = text.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})(?:[0-9a-f]{2})?$/);
    if (long !== null) {
        return [hexByte(long[1] ?? "0"), hexByte(long[2] ?? "0"), hexByte(long[3] ?? "0")];
    }
    const functional = text.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
    if (functional !== null) {
        return [
            clampChannel(Number(functional[1])),
            clampChannel(Number(functional[2])),
            clampChannel(Number(functional[3]))
        ];
    }
    return undefined;
}

export function toHex([red, green, blue]: Rgb): string {
    return `#${[red, green, blue].map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

/** Linear blend from `from` (t = 0) to `to` (t = 1). */
export function mix(from: Rgb, to: Rgb, t: number): Rgb {
    const amount = Math.min(1, Math.max(0, t));
    return [
        Math.round(from[0] + (to[0] - from[0]) * amount),
        Math.round(from[1] + (to[1] - from[1]) * amount),
        Math.round(from[2] + (to[2] - from[2]) * amount)
    ];
}

/** A smooth color ramp through evenly spaced stops; `t` runs from 0 to 1. */
export function gradient(stops: Rgb[]): (t: number) => Rgb {
    if (stops.length === 0) {
        return () => WHITE;
    }
    return (t) => {
        const position = Math.min(1, Math.max(0, t)) * (stops.length - 1);
        const index = Math.min(stops.length - 2, Math.floor(position));
        const from = stops[Math.max(0, index)] ?? WHITE;
        const to = stops[Math.max(0, index) + 1] ?? from;
        return mix(from, to, position - Math.max(0, index));
    };
}

/** Perceived brightness in [0, 1]. */
export function luminance([red, green, blue]: Rgb): number {
    return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
}

export function toHsl([red, green, blue]: Rgb): [number, number, number] {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    if (max === min) {
        return [0, 0, lightness];
    }
    const delta = max - min;
    const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let hue: number;
    if (max === r) {
        hue = (g - b) / delta + (g < b ? 6 : 0);
    } else if (max === g) {
        hue = (b - r) / delta + 2;
    } else {
        hue = (r - g) / delta + 4;
    }
    return [hue / 6, saturation, lightness];
}

export function fromHsl(hue: number, saturation: number, lightness: number): Rgb {
    if (saturation === 0) {
        const gray = clampChannel(lightness * 255);
        return [gray, gray, gray];
    }
    const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    const channel = (offset: number): number => {
        let t = hue + offset;
        t = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    };
    return [clampChannel(channel(1 / 3) * 255), clampChannel(channel(0) * 255), clampChannel(channel(-1 / 3) * 255)];
}

/** Shifts a color's lightness by `amount` (−1 to 1), keeping its hue. */
export function adjustLightness(color: Rgb, amount: number): Rgb {
    const [hue, saturation, lightness] = toHsl(color);
    return fromHsl(hue, saturation, Math.min(1, Math.max(0, lightness + amount)));
}

/**
 * Shades a color for lighting: 0 is the color in deep shadow, 0.5 the color itself, and 1 the color
 * catching full light.
 */
export function shade(color: Rgb, t: number): Rgb {
    const amount = Math.min(1, Math.max(0, t));
    return amount < 0.5
        ? mix(adjustLightness(color, -0.32), color, amount * 2)
        : mix(color, adjustLightness(color, 0.18), (amount - 0.5) * 2);
}

function hexByte(value: string): number {
    return Number.parseInt(value, 16);
}

function clampChannel(value: number): number {
    return Math.round(Math.min(255, Math.max(0, value)));
}

const NAMED_COLORS: Record<string, Rgb> = {
    black: BLACK,
    white: WHITE,
    red: [255, 0, 0],
    green: [0, 128, 0],
    blue: [0, 0, 255],
    gray: [128, 128, 128],
    grey: [128, 128, 128],
    orange: [255, 165, 0],
    purple: [128, 0, 128],
    yellow: [255, 255, 0]
};
