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
 *   - Converts null → undefined (Zurg's .optional() does this)
 *   - Renames `_type` → `type` where `_type` exists
 *   - Adds non-enumerable `_visit` to every object with a string `type` property
 *   - The `_visit` function distinguishes WRAPPED from SPREAD unions:
 *       WRAPPED: wire format is `{ type, value }` → `visitor.key(this.value)`
 *       SPREAD:  wire format is `{ type, ...innerFields }` → `visitor.key(this)`
 *
 * Performance: ~470ms vs ~9,000ms for Zurg on the Square spec.
 */
export async function fastParseIR<IR>(absolutePathToIR: AbsoluteFilePath): Promise<IR> {
    const t0 = Date.now();
    const raw = await readFile(absolutePathToIR, "utf-8");
    const t1 = Date.now();
    const parsed = JSON.parse(raw);
    const t2 = Date.now();
    deepTransform(parsed);
    const t3 = Date.now();
    // biome-ignore lint/suspicious/noConsole: timing diagnostics
    console.log(`[fastParseIR] read=${t1 - t0}ms json=${t2 - t1}ms transform=${t3 - t2}ms total=${t3 - t0}ms`);
    return parsed as IR;
}

/**
 * Recursively walks the JSON tree in-place.
 * - Converts null values to undefined (matches Zurg's .optional() behavior)
 * - Objects with `_type`: rename to `type`, add non-enumerable `_visit`
 * - Objects with string `type` (no `_type`): add non-enumerable `_visit`
 *
 * `_visit` is non-enumerable so it doesn't leak into JSON.stringify,
 * Object.keys, or for...in — preventing contamination of jsonExample data.
 */
function deepTransform(value: unknown): void {
    if (value === null || typeof value !== "object") {
        return;
    }

    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            if (value[i] === null) {
                value[i] = undefined;
            } else {
                deepTransform(value[i]);
            }
        }
        return;
    }

    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    // Transform nested values first (depth-first).
    // Convert null → undefined to match Zurg's .optional() behavior,
    // which converts wire null to parsed undefined.
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]!;
        const v = obj[key];
        if (v === null) {
            obj[key] = undefined;
        } else if (typeof v === "object") {
            deepTransform(v);
        }
    }

    // Handle unions with wire discriminant `_type` (7 types in IR SDK)
    if (typeof obj._type === "string") {
        obj.type = obj._type;
        delete obj._type;
        Object.defineProperty(obj, "_visit", visitDescriptor);
        return;
    }

    // Handle unions with wire discriminant `type` (64 types in IR SDK).
    // Also catches non-union objects — harmless since _visit is only called
    // on actual unions.
    if (typeof obj.type === "string") {
        Object.defineProperty(obj, "_visit", visitDescriptor);
    }
}

/** Reusable property descriptor for _visit (non-enumerable). */
const visitDescriptor: PropertyDescriptor = { value: visitFn, enumerable: false, configurable: true };

/**
 * Set of variant names that use the Zurg WRAPPED pattern:
 * `core.serialization.object({ value: InnerSchema })`.
 *
 * These variants store inner data under a `value` key in wire format.
 * Extracted from @fern-fern/ir-sdk@66.1.0 serialization schemas.
 *
 * Some SPREAD variants (e.g., ExampleEnumExample, ExampleAliasType) also
 * have a field called "value", making them structurally similar to WRAPPED
 * in wire format. The set disambiguates: only listed names use WRAPPED
 * dispatch (`visitor.X(this.value)`), all others use SPREAD.
 */
const WRAPPED_VARIANTS: ReadonlySet<string> = new Set([
    "body",            // ExampleEndpointSuccessResponse
    "error",           // V2HttpEndpointResponseBody
    "file",            // FileUploadRequestProperty
    "json",            // HttpResponseBody, NonStreamHttpResponseBody, V2HttpEndpointResponseBody
    "justRequestBody", // SdkRequestShape
    "ok",              // ExampleResponse
    "property",        // ErrorDeclarationDiscriminantValue
    "proto",           // Source
    "sse",             // ExampleEndpointSuccessResponse
    "stream",          // ExampleEndpointSuccessResponse, V2HttpEndpointResponseBody
    "streaming",       // HttpResponseBody
    "wellKnown",       // ProtobufType
]);

/**
 * Shared _visit function for all discriminated union objects.
 * Uses `this` binding to access the object's properties at call time.
 *
 * Zurg unions have two variant patterns:
 *   WRAPPED: `core.serialization.object({ value: InnerSchema })`
 *     → wire: `{ type: "ok", value: <inner> }`
 *     → dispatch: `visitor.ok(this.value)`
 *   SPREAD: direct type reference
 *     → wire: `{ type: "error", ...innerFields }`
 *     → dispatch: `visitor.error(this)`
 *
 * Detection: WRAPPED iff the object has a "value" property AND the
 * variant name is in WRAPPED_VARIANTS. This handles the edge case where
 * SPREAD types have a "value" field (e.g., ExampleEnumExample).
 */
function visitFn(this: Record<string, unknown>, visitor: Record<string, Function>): unknown {
    const type = this.type as string;
    const handler = visitor[type];
    if (handler != null) {
        // WRAPPED: inner data stored under "value" key
        if ("value" in this && WRAPPED_VARIANTS.has(type)) {
            return handler(this.value);
        }
        // SPREAD: pass the whole object
        return handler(this);
    }
    const other = visitor._other;
    if (other != null) {
        return other(this);
    }
    throw new Error(`Unknown variant: ${type}`);
}
