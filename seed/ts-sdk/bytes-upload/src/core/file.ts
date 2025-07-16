export type FileLike =
    | ArrayBuffer
    | ArrayBufferLike
    | ArrayBufferView
    | Uint8Array
    | import("buffer").Buffer
    | import("buffer").Blob
    | import("buffer").File
    | import("stream").Readable
    | import("stream/web").ReadableStream
    | globalThis.Blob
    | globalThis.File
    | ReadableStream;

export function isFileLike(value: unknown): value is FileLike {
    return (
        isBuffer(value) ||
        isArrayBufferView(value) ||
        isArrayBuffer(value) ||
        isUint8Array(value) ||
        isBlob(value) ||
        isFile(value) ||
        isStreamLike(value) ||
        isReadableStream(value)
    );
}

export async function tryGetFileSizeFromPath(path: string): Promise<number | undefined> {
    try {
        const fsPromise = await import("fs/promises");
        if (!fsPromise || !fsPromise.stat) {
            return undefined;
        }
        const fileStat = await fsPromise.stat(path);
        return fileStat.size;
    } catch (importError) {
        // Fallback to regular fs module if fs/promises fails
        try {
            const fs = await import("fs");
            if (!fs || !fs.promises || !fs.promises.stat) {
                return undefined;
            }
            const fileStat = await fs.promises.stat(path);
            return fileStat.size;
        } catch (fallbackError) {
            // If both attempts fail, file system is not available
            return undefined;
        }
    }
}

export function getNameFromPath(path: string): string | undefined {
    const lastForwardSlash = path.lastIndexOf("/");
    const lastBackSlash = path.lastIndexOf("\\");
    const lastSlashIndex = Math.max(lastForwardSlash, lastBackSlash);
    return lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;
}

type NamedValue = {
    name: string;
} & unknown;

type PathedValue = {
    path: string | { toString(): string };
} & unknown;

type StreamLike = {
    read?: () => unknown;
    pipe?: (dest: unknown) => unknown;
} & unknown;

function isNamedValue(value: unknown): value is NamedValue {
    return typeof value === "object" && value != null && "name" in value;
}

function isPathedValue(value: unknown): value is PathedValue {
    return typeof value === "object" && value != null && "path" in value;
}

function isStreamLike(value: unknown): value is StreamLike {
    return typeof value === "object" && value != null && ("read" in value || "pipe" in value);
}

function isReadableStream(value: unknown): value is ReadableStream {
    return typeof value === "object" && value != null && "getReader" in value;
}

function isBuffer(value: unknown): value is Buffer {
    return typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(value);
}

function isArrayBufferView(value: unknown): value is ArrayBufferView {
    return typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value);
}

function isArrayBuffer(value: unknown): value is ArrayBuffer {
    return typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer;
}

function isUint8Array(value: unknown): value is Uint8Array {
    return typeof Uint8Array !== "undefined" && value instanceof Uint8Array;
}

function isBlob(value: unknown): value is Blob {
    return typeof Blob !== "undefined" && value instanceof Blob;
}

function isFile(value: unknown): value is File {
    return typeof File !== "undefined" && value instanceof File;
}

export function tryGetNameFromFileLike(data: FileLike): string | undefined {
    if (isNamedValue(data)) {
        return data.name;
    }
    if (isPathedValue(data)) {
        return getNameFromPath(data.path.toString());
    }
    return undefined;
}

export async function tryGetContentLengthFromFileLike(data: FileLike): Promise<number | undefined> {
    if (isBuffer(data)) {
        return data.length;
    }
    if (isArrayBufferView(data)) {
        return data.byteLength;
    }
    if (isArrayBuffer(data)) {
        return data.byteLength;
    }
    // Check for Blob/File (same reference in modern environments)
    if (typeof Blob !== "undefined" && data instanceof Blob) {
        return data.size;
    }
    if (typeof File !== "undefined" && data instanceof File) {
        return data.size;
    }
    if (isPathedValue(data)) {
        return await tryGetFileSizeFromPath(data.path.toString());
    }
    return undefined;
}

export function tryGetContentTypeFromFileLike(data: FileLike): string | undefined {
    // Check for Blob/File (same reference in modern environments)
    if (typeof Blob !== "undefined" && data instanceof Blob) {
        return data.type;
    }
    if (typeof File !== "undefined" && data instanceof File) {
        return data.type;
    }

    return undefined;
}
