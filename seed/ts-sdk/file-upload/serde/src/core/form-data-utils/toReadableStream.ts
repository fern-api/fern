export async function toReadableStream(encoder: import("form-data-encoder").FormDataEncoder) {
    return (await import("readable-stream")).Readable.from(encoder);
}
