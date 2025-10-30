/**
 * Normalizes a $ref string by removing line continuations and extra whitespace.
 * This handles cases where YAML refs span multiple lines with backslash continuations
 * or where single-quoted strings preserve backslashes literally.
 *
 * @param ref - The $ref string to normalize
 * @returns The normalized $ref string
 */
export function normalizeRefString(ref: string): string {
    if (typeof ref !== "string") {
        return ref;
    }

    let normalized = ref.replace(/\\\r?\n[ \t]*/g, "");

    normalized = normalized.replace(/\\[ \t]+/g, "");

    normalized = normalized.replace(/\r?\n[ \t]*/g, "");

    normalized = normalized.trim();

    return normalized;
}

/**
 * Recursively walks an object and normalizes all $ref values.
 * This ensures that any $ref strings that span multiple lines in YAML
 * are properly collapsed into single-line strings.
 *
 * @param obj - The object to normalize (modified in place)
 * @returns The normalized object (same reference as input)
 */
export function normalizeRefsDeep<T>(obj: T): T {
    if (obj == null || typeof obj !== "object") {
        return obj;
    }

    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = normalizeRefsDeep(obj[i]);
        }
        return obj;
    }

    for (const key in obj) {
        if (!Object.hasOwn(obj, key)) {
            continue;
        }

        // biome-ignore lint/suspicious/noExplicitAny: need to access dynamic keys
        const value = (obj as any)[key];

        if (key === "$ref" && typeof value === "string") {
            // biome-ignore lint/suspicious/noExplicitAny: need to set dynamic keys
            (obj as any)[key] = normalizeRefString(value);
        } else if (value != null && typeof value === "object") {
            normalizeRefsDeep(value);
        }
    }

    return obj;
}
