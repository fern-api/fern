const SKIP_MARKER = Symbol.for("fern:skip");

/**
 * Recursively removes null/undefined values from an object/array structure.
 * Returns SKIP_MARKER for null/undefined values so they can be filtered out.
 * Tracks which paths were removed for logging purposes.
 */
export function sanitizeNullValues(value: unknown, path: string[] = [], removedPaths: string[][] = []): unknown {
    // Handle null and undefined values
    if (value == null) {
        removedPaths.push([...path]);
        return SKIP_MARKER;
    }

    // Handle arrays
    if (Array.isArray(value)) {
        const result: unknown[] = [];
        for (let i = 0; i < value.length; i++) {
            const child = sanitizeNullValues(value[i], [...path, String(i)], removedPaths);
            if (child !== SKIP_MARKER) {
                result.push(child);
            }
        }
        return result;
    }

    // Handle objects (but not null, which we already handled above)
    // Also exclude Date, RegExp, and other objects that shouldn't be iterated
    if (typeof value === "object" && value !== null && value.constructor === Object) {
        const result: Record<string, unknown> = {};
        try {
            for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
                const child = sanitizeNullValues(v, [...path, k], removedPaths);
                if (child !== SKIP_MARKER) {
                    result[k] = child;
                }
            }
        } catch (err) {
            // If Object.entries fails, skip this object
            removedPaths.push([...path]);
            return SKIP_MARKER;
        }
        return result;
    }

    // Return primitive values as-is
    return value;
}

// Export the SKIP_MARKER for testing purposes
export { SKIP_MARKER };
