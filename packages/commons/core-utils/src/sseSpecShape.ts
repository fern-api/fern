/**
 * Shared utility for detecting whether a set of discriminated union variants
 * matches the SSE (Server-Sent Events) event spec shape.
 *
 * A variant matches when its properties are exclusively drawn from
 * {event, data, id, retry} with correct types:
 *   - event: string (required — must be present on every variant)
 *   - data:  any type
 *   - id:    string
 *   - retry: integer
 */

const SSE_SPEC_FIELDS = new Set(["event", "data", "id", "retry"]);

export interface NormalizedVariantProperty {
    name: string;
    /** Canonical type string: "string", "integer", or any other value for data. */
    type: string;
}

/**
 * Checks whether a single variant's properties match the SSE event spec shape.
 *
 * Returns true when:
 *   1. The variant has an "event" property
 *   2. Every property name is in {event, data, id, retry}
 *   3. event and id are "string", retry is "integer", data is any type
 */
export function variantMatchesSseSpecShape(properties: NormalizedVariantProperty[]): boolean {
    if (properties.length === 0) {
        return false;
    }

    let hasEvent = false;

    for (const prop of properties) {
        if (!SSE_SPEC_FIELDS.has(prop.name)) {
            return false;
        }

        switch (prop.name) {
            case "event":
                hasEvent = true;
                if (prop.type !== "string") {
                    return false;
                }
                break;
            case "id":
                if (prop.type !== "string") {
                    return false;
                }
                break;
            case "retry":
                if (prop.type !== "integer") {
                    return false;
                }
                break;
            case "data":
                // data can be any type
                break;
        }
    }

    return hasEvent;
}

/**
 * Checks whether all variants of a discriminated union match the SSE event spec shape.
 *
 * Returns true only when every variant passes `variantMatchesSseSpecShape`.
 * Returns false for empty variant lists.
 */
export function allVariantsMatchSseSpecShape(variants: NormalizedVariantProperty[][]): boolean {
    if (variants.length === 0) {
        return false;
    }

    return variants.every(variantMatchesSseSpecShape);
}
