/**
 * Spreads caller-supplied `additionalBodyParameters` (from `requestOptions.additionalBodyParameters`)
 * on top of the request body. Caller-supplied properties win over the endpoint body. When no
 * additional body parameters are provided, the original body is returned unchanged so serialization
 * is unaffected.
 */
export function mergeAdditionalBodyParameters(
    body: unknown,
    additionalBodyParameters: Record<string, unknown> | undefined
): unknown {
    if (additionalBodyParameters == null) {
        return body;
    }
    if (typeof body === "object" && body != null) {
        return { ...body, ...additionalBodyParameters };
    }
    return { ...additionalBodyParameters };
}
