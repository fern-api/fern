import { decodeLogo, type RgbaImage } from "./decodeLogo.js";

/**
 * `color` keeps the logo's own colours as truecolor escapes; the CLI prints them as given.
 * `shape` emits uncoloured block characters so the banner's `colors` / `direction` /
 * `lineColors` (and `animate`) config paints the brand gradient at runtime.
 */
export type LogoMode = "color" | "shape";

export interface LogoToBannerOptions {
    /** Banner width in terminal columns. Height follows the logo's aspect ratio. Default 64. */
    width?: number;
    mode?: LogoMode;
    /** Pixels with alpha below this (1-255) are treated as transparent. Default 110. */
    alphaThreshold?: number;
}

const DEFAULT_WIDTH = 64;
const DEFAULT_ALPHA_THRESHOLD = 110;
// Rasterise SVGs well above the target size so box-filter downsampling averages real detail.
const SVG_OVERSAMPLE = 8;

type Pixel = [number, number, number, number];

export function logoToBanner(bytes: Uint8Array, options: LogoToBannerOptions = {}): string {
    const width = validateWidth(options.width ?? DEFAULT_WIDTH);
    return renderBanner(decodeLogo(bytes, width * SVG_OVERSAMPLE), options);
}

/**
 * Renders RGBA pixels as half-block terminal art: each cell is one pixel wide and two
 * tall, drawn with `▀` / `▄` / `█` so the art keeps the logo's proportions.
 */
export function renderBanner(image: RgbaImage, options: LogoToBannerOptions = {}): string {
    const width = validateWidth(options.width ?? DEFAULT_WIDTH);
    const mode = options.mode ?? "color";
    const alphaThreshold = validateAlphaThreshold(options.alphaThreshold ?? DEFAULT_ALPHA_THRESHOLD);

    const cropped = cropToContent(image, alphaThreshold);
    if (cropped == null) {
        throw new Error("The logo has no visible pixels.");
    }
    const columns = Math.min(width, cropped.width);
    // An odd row count leaves the last cell's bottom half transparent (see `pixelAt`).
    const rows = Math.max(1, Math.round((cropped.height * columns) / cropped.width));
    const scaled = boxResize(cropped, columns, rows);

    const lines: string[] = [];
    for (let y = 0; y < rows; y += 2) {
        let line = "";
        for (let x = 0; x < columns; x++) {
            const top = pixelAt(scaled, x, y);
            const bottom = pixelAt(scaled, x, y + 1);
            line += renderCell(
                top[3] >= alphaThreshold ? top : null,
                bottom[3] >= alphaThreshold ? bottom : null,
                mode
            );
        }
        lines.push(line.replace(/ +$/, ""));
    }
    while (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
    }
    if (lines.length === 0) {
        throw new Error(
            "The logo disappeared when scaled down: its strokes are too thin for this width. " +
                "Try a larger width or a lower alpha threshold."
        );
    }
    return `${lines.join("\n")}\n`;
}

function validateWidth(width: number): number {
    if (!Number.isInteger(width) || width < 1) {
        throw new Error(`Invalid width: expected a positive integer, got ${width}.`);
    }
    return width;
}

function validateAlphaThreshold(alphaThreshold: number): number {
    if (!Number.isInteger(alphaThreshold) || alphaThreshold < 1 || alphaThreshold > 255) {
        throw new Error(`Invalid alpha threshold: expected an integer from 1 to 255, got ${alphaThreshold}.`);
    }
    return alphaThreshold;
}

function renderCell(top: Pixel | null, bottom: Pixel | null, mode: LogoMode): string {
    if (mode === "shape") {
        if (top != null && bottom != null) {
            return "█";
        }
        return top != null ? "▀" : bottom != null ? "▄" : " ";
    }
    if (top != null && bottom != null) {
        return `${foreground(top)}${background(bottom)}▀\x1b[0m`;
    }
    if (top != null) {
        return `${foreground(top)}▀\x1b[0m`;
    }
    if (bottom != null) {
        return `${foreground(bottom)}▄\x1b[0m`;
    }
    return " ";
}

function foreground([red, green, blue]: Pixel): string {
    return `\x1b[38;2;${red};${green};${blue}m`;
}

function background([red, green, blue]: Pixel): string {
    return `\x1b[48;2;${red};${green};${blue}m`;
}

function pixelAt(image: RgbaImage, x: number, y: number): Pixel {
    if (y >= image.height) {
        return [0, 0, 0, 0];
    }
    const offset = (y * image.width + x) * 4;
    return [
        image.data[offset] ?? 0,
        image.data[offset + 1] ?? 0,
        image.data[offset + 2] ?? 0,
        image.data[offset + 3] ?? 0
    ];
}

/** Trims fully transparent margins so the art starts at column 0 and has no blank rows. */
function cropToContent(image: RgbaImage, alphaThreshold: number): RgbaImage | undefined {
    let minX = image.width;
    let minY = image.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            if ((image.data[(y * image.width + x) * 4 + 3] ?? 0) >= alphaThreshold) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }
    if (maxX < 0) {
        return undefined;
    }
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
        const start = ((minY + y) * image.width + minX) * 4;
        data.set(image.data.subarray(start, start + width * 4), y * width * 4);
    }
    return { width, height, data };
}

/**
 * Area-average downsample. Colour is averaged premultiplied by alpha so anti-aliased
 * edges don't pick up dark fringes from transparent pixels.
 */
function boxResize(image: RgbaImage, width: number, height: number): RgbaImage {
    const data = new Uint8Array(width * height * 4);
    const scaleX = image.width / width;
    const scaleY = image.height / height;
    for (let y = 0; y < height; y++) {
        const y0 = Math.floor(y * scaleY);
        const y1 = Math.max(y0 + 1, Math.floor((y + 1) * scaleY));
        for (let x = 0; x < width; x++) {
            const x0 = Math.floor(x * scaleX);
            const x1 = Math.max(x0 + 1, Math.floor((x + 1) * scaleX));
            let red = 0;
            let green = 0;
            let blue = 0;
            let alpha = 0;
            let count = 0;
            for (let sy = y0; sy < Math.min(y1, image.height); sy++) {
                for (let sx = x0; sx < Math.min(x1, image.width); sx++) {
                    const [r, g, b, a] = pixelAt(image, sx, sy);
                    red += r * a;
                    green += g * a;
                    blue += b * a;
                    alpha += a;
                    count++;
                }
            }
            const offset = (y * width + x) * 4;
            if (alpha > 0) {
                data[offset] = Math.round(red / alpha);
                data[offset + 1] = Math.round(green / alpha);
                data[offset + 2] = Math.round(blue / alpha);
            }
            data[offset + 3] = count > 0 ? Math.round(alpha / count) : 0;
        }
    }
    return { width, height, data };
}
