import { isDeepStrictEqual } from "node:util";
import type { Overlay, OverlayAction } from "@fern-api/core-utils";

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
type OpenAPISpec = Record<string, any>;

/**
 * A single action in the serialized overlay document.
 * Only includes fields that are relevant (no `remove: false` or `description: ""`).
 */
export interface OverlayOutputAction {
    target: string;
    description?: string;
    update?: unknown;
    remove?: true;
}

/**
 * An OpenAPI Overlay document produced by split.
 */
export interface OverlayDocument {
    overlay: "1.0.0";
    info: { title: string; version: string };
    actions: OverlayOutputAction[];
}

/**
 * Normalizes an OverlayDocument (with optional fields) to the strict Overlay
 * interface expected by `applyOpenAPIOverlay`.
 */
export function toOverlay(doc: OverlayDocument): Overlay {
    return {
        actions: doc.actions.map((a) => ({
            target: a.target,
            description: a.description ?? "",
            update: a.update,
            remove: a.remove ?? false
        }))
    };
}

/**
 * Returns true if the two specs have any differences.
 * Cheaper than `generateOverrides` when you only need a boolean answer.
 */
export function hasChanges(original: OpenAPISpec, modified: OpenAPISpec): boolean {
    return !isDeepStrictEqual(original, modified);
}

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

/**
 * Generates an OpenAPI Overlay document by comparing original and modified specs.
 *
 * Unlike `generateOverrides`, this produces proper overlay actions:
 *  - Array elements are targeted by index (`$.foo[1]`) instead of sparse padding
 *  - Deleted keys/elements use `remove: true` actions
 *  - Appended array elements use the parent array as target (overlay append semantics)
 */
export function generateOverlay(original: OpenAPISpec, modified: OpenAPISpec): OverlayDocument {
    const actions: OverlayAction[] = [];
    if (!isDeepStrictEqual(original, modified)) {
        collectOverlayActions(original, modified, "$", actions);
    }
    return {
        overlay: "1.0.0",
        info: { title: "Fern Overlay", version: "0.0.0" },
        actions: actions.map(toOutputAction)
    };
}

/**
 * Converts an internal OverlayAction to a clean serialized form,
 * omitting empty descriptions and `remove: false`.
 */
function toOutputAction(action: OverlayAction): OverlayOutputAction {
    if (action.remove) {
        return { target: action.target, remove: true };
    }
    return { target: action.target, update: action.update };
}

const SIMPLE_KEY_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Recursively walks the diff tree and emits overlay actions.
 *
 * IMPORTANT: Callers must ensure `original` and `modified` are NOT deep-equal
 * before calling this function. This avoids redundant `isDeepStrictEqual` checks
 * at every level of recursion.
 */
function collectOverlayActions(
    // biome-ignore lint/suspicious/noExplicitAny: recursive diff needs any
    original: any,
    // biome-ignore lint/suspicious/noExplicitAny: recursive diff needs any
    modified: any,
    jsonPath: string,
    actions: OverlayAction[]
): void {
    // Both are arrays — handle element-wise
    if (Array.isArray(original) && Array.isArray(modified)) {
        collectArrayOverlayActions(original, modified, jsonPath, actions);
        return;
    }

    // Both are plain objects — recurse into properties
    if (isPlainObject(original) && isPlainObject(modified)) {
        collectObjectOverlayActions(original, modified, jsonPath, actions);
        return;
    }

    // Everything else: type mismatch, original missing/null, or new value.
    if (modified !== undefined) {
        actions.push({
            target: jsonPath,
            description: "",
            update: modified,
            remove: false
        });
    }
}

function collectObjectOverlayActions(
    original: Record<string, unknown>,
    modified: Record<string, unknown>,
    jsonPath: string,
    actions: OverlayAction[]
): void {
    const leafUpdate: Record<string, unknown> = {};
    let hasLeafChanges = false;

    for (const key of Object.keys(modified)) {
        const originalChild = original[key];
        const modifiedChild = modified[key];

        if (isDeepStrictEqual(originalChild, modifiedChild)) {
            continue;
        }

        const childPath = `${jsonPath}${escapeJsonPathKey(key)}`;

        // If both are objects (or both arrays), recurse for more granular actions.
        // No need to re-check equality — we already know they differ.
        if (canRecurse(originalChild, modifiedChild)) {
            collectOverlayActions(originalChild, modifiedChild, childPath, actions);
        } else {
            leafUpdate[key] = modifiedChild;
            hasLeafChanges = true;
        }
    }

    // Deleted keys — emit remove actions
    for (const key of Object.keys(original)) {
        if (!(key in modified)) {
            const childPath = `${jsonPath}${escapeJsonPathKey(key)}`;
            actions.push({
                target: childPath,
                description: "",
                update: null,
                remove: true
            });
        }
    }

    if (hasLeafChanges) {
        actions.push({
            target: jsonPath,
            description: "",
            update: leafUpdate,
            remove: false
        });
    }
}

function collectArrayOverlayActions(
    original: unknown[],
    modified: unknown[],
    jsonPath: string,
    actions: OverlayAction[]
): void {
    // Check if all elements in both arrays are plain objects (for element-wise diffing)
    const allObjects = original.every((el) => isPlainObject(el)) && modified.every((el) => isPlainObject(el));

    if (!allObjects) {
        // Primitive or mixed arrays — full replacement.
        // Caller already verified arrays are not deep-equal.
        actions.push({
            target: jsonPath,
            description: "",
            update: modified,
            remove: false
        });
        return;
    }

    const commonLength = Math.min(original.length, modified.length);

    // Changed elements — use index targeting and recurse.
    // Check equality per-element; only recurse into those that differ.
    for (let i = 0; i < commonLength; i++) {
        if (!isDeepStrictEqual(original[i], modified[i])) {
            collectOverlayActions(original[i], modified[i], `${jsonPath}[${i}]`, actions);
        }
    }

    // Removed elements — emit remove actions in reverse order so that
    // earlier splices don't shift the indices of later removes.
    for (let i = original.length - 1; i >= commonLength; i--) {
        actions.push({
            target: `${jsonPath}[${i}]`,
            description: "",
            update: null,
            remove: true
        });
    }

    // Appended elements — per the overlay spec, targeting an array with a
    // non-array update value appends the value to the array.
    for (let i = commonLength; i < modified.length; i++) {
        actions.push({
            target: jsonPath,
            description: "",
            update: modified[i],
            remove: false
        });
    }
}

/**
 * Returns true if both values are recursible (both plain objects or both arrays).
 */
function canRecurse(a: unknown, b: unknown): boolean {
    if (a == null || b == null) {
        return false;
    }
    if (typeof a !== "object" || typeof b !== "object") {
        return false;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return true;
    }
    if (!Array.isArray(a) && !Array.isArray(b)) {
        return true;
    }
    return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Escapes a key for use in a JSONPath expression.
 * Keys containing special characters (/, ~, ., spaces, etc.) are bracket-quoted.
 */
function escapeJsonPathKey(key: string): string {
    if (SIMPLE_KEY_RE.test(key)) {
        return `.${key}`;
    }
    return `['${key.replace(/'/g, "\\'")}']`;
}
