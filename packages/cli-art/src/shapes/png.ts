import { inflateSync } from "zlib";

/** Decoded image pixels: RGBA, 8 bits per channel, row by row. */
export interface Pixels {
    width: number;
    height: number;
    data: Uint8Array;
}

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * Decodes a PNG into RGBA pixels. Supports grayscale, RGB, palette, and alpha color types at every bit
 * depth, plus palette transparency (tRNS). Interlaced (Adam7) images are not supported.
 */
export function decodePng(buffer: Uint8Array): Pixels {
    if (!SIGNATURE.every((byte, index) => buffer[index] === byte)) {
        throw new Error("Not a PNG file");
    }
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    let offset = 8;
    let width = 0;
    let height = 0;
    let bitDepth = 8;
    let colorType = 6;
    let interlace = 0;
    let palette: Uint8Array | undefined;
    let transparency: Uint8Array | undefined;
    const data: Uint8Array[] = [];

    while (offset + 8 <= buffer.length) {
        const length = view.getUint32(offset);
        const type = String.fromCharCode(...buffer.subarray(offset + 4, offset + 8));
        const chunk = buffer.subarray(offset + 8, offset + 8 + length);
        if (type === "IHDR") {
            const header = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
            width = header.getUint32(0);
            height = header.getUint32(4);
            bitDepth = chunk[8] ?? 8;
            colorType = chunk[9] ?? 6;
            interlace = chunk[12] ?? 0;
        } else if (type === "PLTE") {
            palette = chunk;
        } else if (type === "tRNS") {
            transparency = chunk;
        } else if (type === "IDAT") {
            data.push(chunk);
        } else if (type === "IEND") {
            break;
        }
        offset += 12 + length;
    }
    if (width === 0 || height === 0) {
        throw new Error("PNG is missing its header");
    }
    if (interlace !== 0) {
        throw new Error("Interlaced PNGs are not supported; re-export the image without interlacing");
    }

    const channels = CHANNELS[colorType];
    if (channels === undefined) {
        throw new Error(`Unsupported PNG color type ${colorType}`);
    }
    const bitsPerPixel = channels * bitDepth;
    const bytesPerPixel = Math.max(1, bitsPerPixel / 8);
    const stride = Math.ceil((width * bitsPerPixel) / 8);
    const raw = inflateSync(Buffer.concat(data.map((part) => Buffer.from(part))));
    const unfiltered = unfilter(raw, stride, height, bytesPerPixel);

    const pixels = new Uint8Array(width * height * 4);
    const maxValue = (1 << bitDepth) - 1;
    for (let y = 0; y < height; y++) {
        const row = unfiltered.subarray(y * stride, (y + 1) * stride);
        for (let x = 0; x < width; x++) {
            const sample = (channel: number): number => readSample(row, x * channels + channel, bitDepth);
            const scale = (value: number): number => Math.round((value / maxValue) * 255);
            const target = (y * width + x) * 4;
            let rgba: [number, number, number, number];
            switch (colorType) {
                case 0: {
                    const gray = scale(sample(0));
                    rgba = [gray, gray, gray, transparentGray(transparency, sample(0)) ? 0 : 255];
                    break;
                }
                case 2: {
                    const rgb = [sample(0), sample(1), sample(2)];
                    rgba = [
                        scale(rgb[0] ?? 0),
                        scale(rgb[1] ?? 0),
                        scale(rgb[2] ?? 0),
                        transparentRgb(transparency, rgb) ? 0 : 255
                    ];
                    break;
                }
                case 3: {
                    const index = sample(0);
                    rgba = [
                        palette?.[index * 3] ?? 0,
                        palette?.[index * 3 + 1] ?? 0,
                        palette?.[index * 3 + 2] ?? 0,
                        transparency?.[index] ?? 255
                    ];
                    break;
                }
                case 4: {
                    const gray = scale(sample(0));
                    rgba = [gray, gray, gray, scale(sample(1))];
                    break;
                }
                default:
                    rgba = [scale(sample(0)), scale(sample(1)), scale(sample(2)), scale(sample(3))];
            }
            pixels.set(rgba, target);
        }
    }
    return { width, height, data: pixels };
}

/** Channels per pixel for each PNG color type. */
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function readSample(row: Uint8Array, index: number, bitDepth: number): number {
    if (bitDepth === 8) {
        return row[index] ?? 0;
    }
    if (bitDepth === 16) {
        return ((row[index * 2] ?? 0) << 8) | (row[index * 2 + 1] ?? 0);
    }
    const bitOffset = index * bitDepth;
    const byte = row[Math.floor(bitOffset / 8)] ?? 0;
    const shift = 8 - bitDepth - (bitOffset % 8);
    return (byte >> shift) & ((1 << bitDepth) - 1);
}

function unfilter(raw: Uint8Array, stride: number, height: number, bytesPerPixel: number): Uint8Array {
    const out = new Uint8Array(stride * height);
    const step = Math.ceil(bytesPerPixel);
    for (let y = 0; y < height; y++) {
        const filter = raw[y * (stride + 1)] ?? 0;
        const source = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
        const rowStart = y * stride;
        for (let x = 0; x < stride; x++) {
            const left = x >= step ? (out[rowStart + x - step] ?? 0) : 0;
            const up = y > 0 ? (out[rowStart - stride + x] ?? 0) : 0;
            const upLeft = y > 0 && x >= step ? (out[rowStart - stride + x - step] ?? 0) : 0;
            const value = source[x] ?? 0;
            let predicted = 0;
            switch (filter) {
                case 1:
                    predicted = left;
                    break;
                case 2:
                    predicted = up;
                    break;
                case 3:
                    predicted = Math.floor((left + up) / 2);
                    break;
                case 4:
                    predicted = paeth(left, up, upLeft);
                    break;
                default:
                    predicted = 0;
            }
            out[rowStart + x] = (value + predicted) & 0xff;
        }
    }
    return out;
}

function paeth(left: number, up: number, upLeft: number): number {
    const estimate = left + up - upLeft;
    const distanceLeft = Math.abs(estimate - left);
    const distanceUp = Math.abs(estimate - up);
    const distanceUpLeft = Math.abs(estimate - upLeft);
    if (distanceLeft <= distanceUp && distanceLeft <= distanceUpLeft) {
        return left;
    }
    return distanceUp <= distanceUpLeft ? up : upLeft;
}

function transparentGray(transparency: Uint8Array | undefined, value: number): boolean {
    return (
        transparency !== undefined &&
        transparency.length >= 2 &&
        (((transparency[0] ?? 0) << 8) | (transparency[1] ?? 0)) === value
    );
}

function transparentRgb(transparency: Uint8Array | undefined, rgb: number[]): boolean {
    if (transparency === undefined || transparency.length < 6) {
        return false;
    }
    return rgb.every(
        (value, index) => (((transparency[index * 2] ?? 0) << 8) | (transparency[index * 2 + 1] ?? 0)) === value
    );
}
