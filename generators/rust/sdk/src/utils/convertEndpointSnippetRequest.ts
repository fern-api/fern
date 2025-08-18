import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { dynamic } from "@fern-fern/ir-sdk/api";

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match. This converts the field names to match what DynamicSnippetsGenerator expects.
 */
export function convertDynamicEndpointSnippetRequest(
    request: dynamic.EndpointSnippetRequest
): FernIr.dynamic.EndpointSnippetRequest {
    return {
        ...request,
        baseURL: request.baseUrl
    } as FernIr.dynamic.EndpointSnippetRequest;
}
