/**
 * Spreads caller-supplied `bodyProperties` (from `requestOptions.bodyProperties`) on top of the
 * request body. Caller-supplied properties win over the endpoint body. When no additional body
 * properties are provided, the original body is returned unchanged so serialization is unaffected.
 */
export function mergeBodyProperties(
    body: unknown,
    bodyProperties: Record<string, unknown> | undefined
): unknown {
    if (bodyProperties == null) {
        return body;
    }
    if (typeof body === "object" && body != null) {
        return { ...body, ...bodyProperties };
    }
    return { ...bodyProperties };
}
