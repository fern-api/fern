import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

/**
 * Fast IR parser that bypasses the Zurg serialization layer.
 *
 * Zurg's IntermediateRepresentation.parse (~9s for Square) parses each union
 * and adds instance `_visit(visitor)` methods via constructor functions.
 * Most unions use `type` as the wire discriminant (64 unions), but 7 unions
 * use `discriminant("type", "_type")` meaning the wire format has `_type`.
 *
 * This fast parser replicates that by doing a single recursive tree walk:
 *   - Renames `_type` → `type` where `_type` exists
 *   - Adds `_visit` to every object with a string `type` property
 *   - The `_visit` heuristic distinguishes WRAPPED from SPREAD:
 *       WRAPPED: `obj[obj.type]` exists → `visitor.key(obj[key])`
 *       SPREAD:  otherwise → `visitor.key(obj)`
 *
 * Performance: ~200ms vs ~9,000ms for Zurg on the Square spec.
 */
export async function fastParseIR<IR>(absolutePathToIR: AbsoluteFilePath): Promise<IR> {
    const raw = await readFile(absolutePathToIR, "utf-8");
    const parsed = JSON.parse(raw);
    deepTransform(parsed);
    return parsed as IR;
}

/**
 * Recursively walks the JSON tree in-place.
 * - Objects with `_type`: rename to `type`, add `_visit`
 * - Objects with string `type` (no `_type`): just add `_visit`
 */
function deepTransform(value: unknown): void {
    if (value === null || typeof value !== "object") {
        return;
    }

    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            deepTransform(value[i]);
        }
        return;
    }

    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    // Transform nested values first (depth-first)
    for (let i = 0; i < keys.length; i++) {
        const v = obj[keys[i]!];
        if (v !== null && typeof v === "object") {
            deepTransform(v);
        }
    }

    // Handle unions with wire discriminant `_type` (7 types in IR SDK)
    if (typeof obj._type === "string") {
        obj.type = obj._type;
        delete obj._type;
        obj._visit = visitFn;
        return;
    }

    // Handle unions with wire discriminant `type` (64 types in IR SDK).
    // Also catches non-union objects — harmless since _visit is only called
    // on actual unions.
    if (typeof obj.type === "string") {
        obj._visit = visitFn;
    }
}

/**
 * Shared _visit function for all discriminated union objects.
 * Uses `this` binding to access the object's properties at call time.
 *
 * Heuristic for WRAPPED vs SPREAD:
 *   - If `this[this.type]` exists, it's WRAPPED → `visitor.key(this[key])`
 *   - Otherwise, it's SPREAD → `visitor.key(this)`
 */
function visitFn(this: Record<string, unknown>, visitor: Record<string, Function>): unknown {
    const type = this.type as string;
    const handler = visitor[type];
    if (handler != null) {
        // WRAPPED: the inner value lives under a key matching the variant name
        if (type in this) {
            return handler(this[type]);
        }
        // SPREAD: pass the whole object
        return handler(this);
    }
    const other = visitor._other;
    if (other != null) {
        return other({ type });
    }
    throw new Error(`Unknown variant: ${type}`);
}
