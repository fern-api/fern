const MAX_DEPTH = 64;

/**
 * Produces a deterministic hash of a JSON-serializable value.
 * Keys of objects are sorted to ensure consistent ordering.
 *
 * Uses FNV-1a hashing with direct numeric accumulation into a single
 * 32-bit hash, output as an 8-character hex string. No intermediate
 * string is built, so memory pressure stays minimal even for large
 * object graphs.
 */
export function hashJSON(obj: unknown): string {
    let h = 0x811c9dc5 | 0;

    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    function traverse(value: any, currentDepth: number): void {
        const t = typeof value;
        if (t !== "object" || value === null) {
            const s: string = t === "string" ? value : String(value);
            for (let i = 0, len = s.length; i < len; i++) {
                h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
            }
            return;
        }
        if (currentDepth > MAX_DEPTH) {
            const s = "[MaxDepthExceeded]";
            for (let i = 0; i < 18; i++) {
                h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
            }
            return;
        }
        if (Array.isArray(value)) {
            h = Math.imul(h ^ 91, 0x01000193); // '['
            for (let i = 0; i < value.length; i++) {
                if (i > 0) {
                    h = Math.imul(h ^ 44, 0x01000193); // ','
                }
                traverse(value[i], currentDepth + 1);
            }
            h = Math.imul(h ^ 93, 0x01000193); // ']'
        } else {
            h = Math.imul(h ^ 123, 0x01000193); // '{'
            const keys = Object.keys(value).sort();
            const klen = keys.length;
            for (let i = 0; i < klen; i++) {
                if (i > 0) {
                    h = Math.imul(h ^ 44, 0x01000193); // ','
                }
                const k = keys[i] ?? "";
                for (let j = 0, jl = k.length; j < jl; j++) {
                    h = Math.imul(h ^ k.charCodeAt(j), 0x01000193);
                }
                h = Math.imul(h ^ 58, 0x01000193); // ':'
                traverse(value[k], currentDepth + 1);
            }
            h = Math.imul(h ^ 125, 0x01000193); // '}'
        }
    }

    traverse(obj, 0);
    return (h >>> 0).toString(16).padStart(8, "0");
}
