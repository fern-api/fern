import { createHash } from "crypto";

const MAX_DEPTH = 64;
const BUFFER_FLUSH_SIZE = 65536;

export function hashJSON(obj: unknown): string {
    const hash = createHash("md5");
    let buffer = "";

    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    function traverse(value: any, currentDepth: number): void {
        if (typeof value !== "object" || value == null) {
            buffer += String(value);
            if (buffer.length >= BUFFER_FLUSH_SIZE) {
                hash.update(buffer);
                buffer = "";
            }
            return;
        }
        if (currentDepth > MAX_DEPTH) {
            buffer += "[MaxDepthExceeded]";
            if (buffer.length >= BUFFER_FLUSH_SIZE) {
                hash.update(buffer);
                buffer = "";
            }
            return;
        }

        if (Array.isArray(value)) {
            buffer += "[";
            for (let i = 0; i < value.length; i++) {
                if (i > 0) {
                    buffer += ",";
                }
                traverse(value[i], currentDepth + 1);
            }
            buffer += "]";
        } else {
            buffer += "{";
            const keys = Object.keys(value).sort();
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]!;
                if (i > 0) {
                    buffer += ",";
                }
                buffer += key;
                buffer += ":";
                traverse(value[key], currentDepth + 1);
            }
            buffer += "}";
        }
        if (buffer.length >= BUFFER_FLUSH_SIZE) {
            hash.update(buffer);
            buffer = "";
        }
    }

    traverse(obj, 0);
    if (buffer.length > 0) {
        hash.update(buffer);
    }
    return hash.digest("hex");
}
