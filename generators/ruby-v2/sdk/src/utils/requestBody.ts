import { FernIr } from "@fern-fern/ir-sdk";

/** Wire content type for form-urlencoded request bodies. */
export const URL_ENCODED_CONTENT_TYPE = "application/x-www-form-urlencoded";

/**
 * Returns true if the given request body is sent as
 * `application/x-www-form-urlencoded` form data (rather than JSON).
 *
 * This is the single source of truth for form-urlencoded detection: the raw
 * client uses it to pick the request class, and the SDK context uses it to
 * decide whether to emit the internal URL-encoded request as-is file and its
 * root `require_relative`. Keeping both driven by one predicate guarantees the
 * require and its file can never ship apart.
 */
export function isUrlEncodedRequestBody(requestBody: FernIr.HttpRequestBody | undefined): boolean {
    return (
        (requestBody?.type === "inlinedRequestBody" || requestBody?.type === "reference") &&
        requestBody.contentType === URL_ENCODED_CONTENT_TYPE
    );
}

/**
 * Returns true if any endpoint in the IR sends a form-urlencoded request body.
 */
export function hasUrlEncodedRequestBody(ir: FernIr.IntermediateRepresentation): boolean {
    return Object.values(ir.services).some((service) =>
        service.endpoints.some((endpoint) => isUrlEncodedRequestBody(endpoint.requestBody))
    );
}
