import { Readable } from "stream";
import { ReadableStream } from "stream/web";
import { SeedBytesUploadClient } from "./dist/esm/index.mjs";
import { createReadStream } from "fs";

(async () => {
    const client = new SeedBytesUploadClient({
        environment: "http://localhost:3000",
    });
    await client.service.upload(createReadStreamFromFile("./package.json"));
    await client.service.upload(createReadableStreamFromFile("./package.json"));
    await client.service.upload(await createBufferFromFile("./package.json"));
    await client.service.upload(await createBlobFromFile("./package.json", "application/json"));
    await client.service.upload(await createFileFromFile("./package.json", "application/json"));
    await client.service.upload(await createArrayBufferFromFile("./package.json"));
    await client.service.upload(await createArrayBufferViewFromFile("./package.json"));
    await client.service.upload(await createUint8ArrayFromFile("./package.json"));

    await client.service.upload({
        data: await createBlobFromFile("./package.json", "application/json"),
    });
    await client.service.upload({
        data: createReadStreamFromFile("./package.json"),
        fileName: "explicit-package.json",
        contentType: "application/json",
        contentLength: 1949,
    });
})();

function createReadStreamFromFile(filePath: string): Readable {
    return createReadStream(filePath);
}

function createReadableStreamFromFile(filePath: string): ReadableStream {
    return Readable.toWeb(createReadStream(filePath));
}

function createBufferFromFile(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = createReadStream(filePath);
        stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

function createBlobFromFile(filePath: string, contentType?: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = createReadStream(filePath);
        stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on("end", () => resolve(new Blob(chunks, { type: contentType })));
        stream.on("error", reject);
    });
}

function createFileFromFile(filePath: string, contentType?: string): Promise<File> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = createReadStream(filePath);
        stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on("end", () => {
            const blob = new Blob(chunks, { type: contentType });
            const fileName = filePath.split("/").pop() || "file";
            resolve(new File([blob], fileName, { type: blob.type }));
        });
        stream.on("error", reject);
    });
}

function createArrayBufferFromFile(filePath: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = createReadStream(filePath);
        stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on("end", () => {
            const buffer = Buffer.concat(chunks);
            resolve(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
        });
        stream.on("error", reject);
    });
}

function createArrayBufferViewFromFile(filePath: string): Promise<ArrayBufferView> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = createReadStream(filePath);
        stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on("end", () => {
            const buffer = Buffer.concat(chunks);
            resolve(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length));
        });
        stream.on("error", reject);
    });
}

function createUint8ArrayFromFile(filePath: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const stream = createReadStream(filePath);
        stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        stream.on("end", () => {
            const buffer = Buffer.concat(chunks);
            resolve(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length));
        });
        stream.on("error", reject);
    });
}
