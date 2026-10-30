import { Resvg } from "@resvg/resvg-js";
import { PNG } from "pngjs";

export interface RgbaImage {
    width: number;
    height: number;
    /** Row-major RGBA, 4 bytes per pixel. */
    data: Uint8Array;
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * Decodes a PNG or SVG logo to RGBA pixels. SVGs are rasterised at `svgWidth`
 * pixels wide so small vector logos keep their detail before downsampling.
 */
export function decodeLogo(bytes: Uint8Array, svgWidth: number): RgbaImage {
    if (PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) {
        const png = PNG.sync.read(Buffer.from(bytes));
        return { width: png.width, height: png.height, data: png.data };
    }

    const text = Buffer.from(bytes).toString("utf8");
    if (/<svg[\s>]/i.test(text)) {
        const rendered = new Resvg(text, {
            fitTo: { mode: "width", value: svgWidth },
            background: "rgba(0, 0, 0, 0)"
        }).render();
        return { width: rendered.width, height: rendered.height, data: rendered.pixels };
    }

    throw new Error("Unsupported logo format: expected a PNG or SVG file.");
}
