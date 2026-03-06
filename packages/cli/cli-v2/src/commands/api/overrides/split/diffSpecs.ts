import { isDeepStrictEqual } from "node:util";

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
type OpenAPISpec = Record<string, any>;

/**
 * Generates an overrides object by comparing original and modified specs.
 * Only includes paths/properties that have been added or changed in the modified spec.
 */
export function generateOverrides(original: OpenAPISpec, modified: OpenAPISpec): OpenAPISpec {
    const overrides: OpenAPISpec = {};

    for (const key of Object.keys(modified)) {
        const diff = diffObjects(original[key], modified[key]);
        if (diff !== undefined) {
            overrides[key] = diff;
        }
    }

    return overrides;
}

/**
 * Recursively diff two objects and return only the differences.
 * Returns undefined if there are no differences.
 * @internal Exported for testing only.
 */
// biome-ignore lint/suspicious/noExplicitAny: recursive diff needs any
export function diffObjects(original: any, modified: any): any {
    if (modified === undefined) {
        return undefined;
    }
    if (original === modified) {
        return undefined;
    }
    if (original === undefined || original === null) {
        return modified;
    }

    // Primitive types
    if (typeof modified !== "object" || modified === null) {
        return original !== modified ? modified : undefined;
    }

    // Arrays
    if (Array.isArray(modified)) {
        if (!Array.isArray(original)) {
            return modified;
        }

        // Arrays of objects with no removals: produce sparse element-wise diff.
        // This mirrors how mergeWithOverrides (lodash mergeWith) handles arrays
        // of objects — it merges index-by-index, so [{}, {}, {changed: "val"}]
        // leaves the first two elements untouched and patches the third.
        const allObjects =
            modified.length >= original.length &&
            // biome-ignore lint/suspicious/noExplicitAny: recursive diff needs any
            original.every((el: any) => typeof el === "object" && el !== null && !Array.isArray(el)) &&
            // biome-ignore lint/suspicious/noExplicitAny: recursive diff needs any
            modified.every((el: any) => typeof el === "object" && el !== null && !Array.isArray(el));

        if (allObjects) {
            const sparse: unknown[] = [];
            let hasDiff = false;

            for (let i = 0; i < modified.length; i++) {
                if (i < original.length) {
                    const elementDiff = diffObjects(original[i], modified[i]);
                    if (elementDiff !== undefined) {
                        sparse.push(elementDiff);
                        hasDiff = true;
                    } else {
                        sparse.push({});
                    }
                } else {
                    // Appended element
                    sparse.push(modified[i]);
                    hasDiff = true;
                }
            }

            return hasDiff ? sparse : undefined;
        }

        // Primitive arrays or arrays that shrank: whole replacement
        return !isDeepStrictEqual(original, modified) ? modified : undefined;
    }

    // Type mismatch — return full modified value
    if (typeof original !== "object" || original === null || Array.isArray(original)) {
        return modified;
    }

    // Object recursion
    const diff: Record<string, unknown> = {};
    for (const key of Object.keys(modified)) {
        const childDiff = diffObjects(original[key], modified[key]);
        if (childDiff !== undefined) {
            diff[key] = childDiff;
        }
    }

    // Deleted keys are not included — overrides only add/modify.
    return Object.keys(diff).length === 0 ? undefined : diff;
}
