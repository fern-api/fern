const MAX_DEPTH = 64;

/**
 * Produces a deterministic hash of a JSON-serializable value.
 * Keys of objects are sorted to ensure consistent ordering.
 *
 * Uses an optimized variant of FNV-1a with direct numeric accumulation.
 * No intermediate canonical string is built, keeping memory pressure
 * minimal even for large object graphs.
 */
export function hashJSON(obj: unknown): string {
    let hash = 0x811c9dc5;

    function feedChar(char: number): void {
        hash ^= char;
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        hash >>>= 0;
    }

    function feedString(str: string): void {
        for (let i = 0, len = str.length; i < len; i++) {
            feedChar(str.charCodeAt(i));
        }
    }

    // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
    function traverse(value: any, currentDepth: number): void {
        if (typeof value === "object" && value != null) {
            if (currentDepth > MAX_DEPTH) {
                feedString("[MaxDepthExceeded]");
                return;
            }

            if (Array.isArray(value)) {
                feedChar(91); // '['
                for (let i = 0; i < value.length; i++) {
                    if (i > 0) {
                        feedChar(44); // ','
                    }
                    traverse(value[i], currentDepth + 1);
                }
                feedChar(93); // ']'
            } else {
                feedChar(123); // '{'
                const keys = Object.keys(value).sort();
                const klen = keys.length;
                for (let i = 0; i < klen; i++) {
                    if (i > 0) {
                        feedChar(44); // ','
                    }
                    feedString(keys[i] ?? "");
                    feedChar(58); // ':'
                    traverse(value[keys[i] ?? ""], currentDepth + 1);
                }
                feedChar(125); // '}'
            }
        } else {
            feedString(String(value));
        }
    }

    traverse(obj, 0);
    return hash.toString(16);
}
