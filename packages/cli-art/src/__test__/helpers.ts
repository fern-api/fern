import { deflateSync } from "node:zlib";

export const SQUARE_PATH = "M0 0H10V10H0Z";

/** Encodes RGBA pixels as a minimal PNG, so tests don't need image fixtures. */
export function encodePng(
    width: number,
    height: number,
    pixel: (x: number, y: number) => [number, number, number, number]
): Buffer {
    const rowLength = width * 4 + 1;
    const raw = Buffer.alloc(rowLength * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            raw.set(pixel(x, y), y * rowLength + 1 + x * 4);
        }
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 8;
    header[9] = 6;
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk("IHDR", header),
        chunk("IDAT", deflateSync(raw)),
        chunk("IEND", Buffer.alloc(0))
    ]);
}

function chunk(type: string, data: Buffer): Buffer {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([length, body, crc]);
}

function crc32(bytes: Buffer): number {
    let crc = ~0;
    for (const byte of bytes) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++) {
            crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
        }
    }
    return ~crc >>> 0;
}
