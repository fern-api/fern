const MAX_DEPTH = 64;

/**
 * Produces a deterministic hash of a JSON-serializable value.
 * Keys of objects are sorted to ensure consistent ordering.
 *
 * Uses dual FNV-1a hashing (two independent 32-bit hashes combined into
 * a 16-character hex string) with direct numeric accumulation — no
 * intermediate string is built, so memory pressure stays minimal even
 * for very large object graphs.
 */
export function hashJSON(obj: unknown): string {
    let h1 = 0x811c9dc5 | 0;
    let h2 = 0x01000193 | 0;

    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    function traverse(value: any, currentDepth: number): void {
        const t = typeof value;
        if (t !== "object" || value === null) {
            const s: string = t === "string" ? value : String(value);
            for (let i = 0, len = s.length; i < len; i++) {
                const c = s.charCodeAt(i);
                h1 = Math.imul(h1 ^ c, 0x01000193);
                h2 = Math.imul(h2 ^ c, 0x811c9dc5);
            }
            return;
        }
        if (currentDepth > MAX_DEPTH) {
            const s = "[MaxDepthExceeded]";
            for (let i = 0; i < 18; i++) {
                const c = s.charCodeAt(i);
                h1 = Math.imul(h1 ^ c, 0x01000193);
                h2 = Math.imul(h2 ^ c, 0x811c9dc5);
            }
            return;
        }
        if (Array.isArray(value)) {
            h1 = Math.imul(h1 ^ 91, 0x01000193); // '['
            h2 = Math.imul(h2 ^ 91, 0x811c9dc5);
            for (let i = 0; i < value.length; i++) {
                if (i > 0) {
                    h1 = Math.imul(h1 ^ 44, 0x01000193); // ','
                    h2 = Math.imul(h2 ^ 44, 0x811c9dc5);
                }
                traverse(value[i], currentDepth + 1);
            }
            h1 = Math.imul(h1 ^ 93, 0x01000193); // ']'
            h2 = Math.imul(h2 ^ 93, 0x811c9dc5);
        } else {
            h1 = Math.imul(h1 ^ 123, 0x01000193); // '{'
            h2 = Math.imul(h2 ^ 123, 0x811c9dc5);
            const keys = Object.keys(value).sort();
            const klen = keys.length;
            for (let i = 0; i < klen; i++) {
                if (i > 0) {
                    h1 = Math.imul(h1 ^ 44, 0x01000193); // ','
                    h2 = Math.imul(h2 ^ 44, 0x811c9dc5);
                }
                const k = keys[i] ?? "";
                for (let j = 0, jl = k.length; j < jl; j++) {
                    const c = k.charCodeAt(j);
                    h1 = Math.imul(h1 ^ c, 0x01000193);
                    h2 = Math.imul(h2 ^ c, 0x811c9dc5);
                }
                h1 = Math.imul(h1 ^ 58, 0x01000193); // ':'
                h2 = Math.imul(h2 ^ 58, 0x811c9dc5);
                traverse(value[k], currentDepth + 1);
            }
            h1 = Math.imul(h1 ^ 125, 0x01000193); // '}'
            h2 = Math.imul(h2 ^ 125, 0x811c9dc5);
        }
    }

    traverse(obj, 0);
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}
