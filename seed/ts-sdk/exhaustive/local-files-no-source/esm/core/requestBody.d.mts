/**
 * Spreads caller-supplied `bodyProperties` (from `requestOptions.bodyProperties`) on top of the
 * request body. Caller-supplied properties win over the endpoint body. When no additional body
 * properties are provided, the original body is returned unchanged so serialization is unaffected.
 */
export declare function mergeBodyProperties(body: unknown, bodyProperties: Record<string, unknown> | undefined): unknown;
