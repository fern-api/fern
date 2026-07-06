/**
 * Spreads caller-supplied `bodyProperties` (from `requestOptions.bodyProperties`) on top of the
 * request body. Caller-supplied properties win over the endpoint body. When no additional body
 * properties are provided, the original body is returned unchanged so serialization is unaffected.
 */
export function mergeBodyProperties(body, bodyProperties) {
    if (bodyProperties == null) {
        return body;
    }
    if (typeof body === "object" && body != null) {
        return Object.assign(Object.assign({}, body), bodyProperties);
    }
    return Object.assign({}, bodyProperties);
}
