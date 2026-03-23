import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Checks if the endpoint has any 2xx response in v2Responses that has no body.
 * This is typically the case when an OpenAPI spec defines a 204 No Content response
 * alongside other success responses (e.g., 200 with JSON body).
 */
export function endpointHasEmptyBodyResponse(endpoint: FernIr.HttpEndpoint): boolean {
    const v2Responses = endpoint.v2Responses?.responses;
    if (v2Responses == null || v2Responses.length <= 1) {
        return false;
    }
    return v2Responses.some(
        (response) =>
            response.statusCode != null &&
            response.statusCode >= 200 &&
            response.statusCode < 300 &&
            response.body == null
    );
}
