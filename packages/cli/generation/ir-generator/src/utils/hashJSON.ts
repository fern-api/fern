export function hashJSON(obj: unknown): string {
    let hash = 0x811c9dc5;
    const seen = new WeakSet();

    function traverse(value: any) {
        if (typeof value === "object" && value != null) {
            if (seen.has(value)) {
                updateHash("[Circular]");
                return;
            }
            seen.add(value);

            if (Array.isArray(value)) {
                updateHash("[");
                for (let i = 0; i < value.length; i++) {
                    if (i > 0) {
                        updateHash(",");
                    }
                    traverse(value[i]);
                }
                updateHash("]");
            } else {
                updateHash("{");
                const keys = Object.keys(value).sort();
                keys.forEach((key, index) => {
                    if (index > 0) {
                        updateHash(",");
                    }
                    updateHash(key);
                    updateHash(":");
                    traverse(value[key]);
                });
                updateHash("}");
            }
        } else {
            updateHash(String(value));
        }
    }

    function updateHash(str: string) {
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash ^= char;
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
            hash >>>= 0;
        }
    }

    traverse(obj);
    return hash.toString(16);
}
