/**
 * Converts a kebab-case string to camelCase.
 * Example: "respect-nullable-schemas" -> "respectNullableSchemas"
 */
export function kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts a camelCase string to kebab-case.
 * Example: "respectNullableSchemas" -> "respect-nullable-schemas"
 */
export function camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Recursively converts all kebab-case keys in an object to camelCase.
 * Handles nested objects and arrays.
 */
export function convertKeysToCamelCase<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => convertKeysToCamelCase(item)) as T;
    }

    if (typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            const camelKey = kebabToCamel(key);
            result[camelKey] = convertKeysToCamelCase(value);
        }
        return result as T;
    }

    return obj;
}

/**
 * Recursively converts all camelCase keys in an object to kebab-case.
 * Handles nested objects and arrays.
 */
export function convertKeysToKebabCase<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => convertKeysToKebabCase(item)) as T;
    }

    if (typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            const kebabKey = camelToKebab(key);
            result[kebabKey] = convertKeysToKebabCase(value);
        }
        return result as T;
    }

    return obj;
}

/**
 * Creates a Zod preprocessor that converts kebab-case keys to camelCase.
 * Use this with z.preprocess() to support legacy configuration format.
 *
 * Example:
 * ```typescript
 * const MySchema = z.preprocess(
 *   kebabCasePreprocessor,
 *   z.object({ myField: z.string() })
 * );
 * // Now accepts both { "my-field": "value" } and { myField: "value" }
 * ```
 */
export function kebabCasePreprocessor(val: unknown): unknown {
    return convertKeysToCamelCase(val);
}
