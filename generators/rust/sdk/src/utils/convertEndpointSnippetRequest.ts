import { FernIr as DynamicFernIr } from "@fern-api/dynamic-ir-sdk";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match. This converts the field names to match what DynamicSnippetsGenerator expects.
 */
export function convertDynamicEndpointSnippetRequest(
    request: FernIr.dynamic.EndpointSnippetRequest
): DynamicFernIr.dynamic.EndpointSnippetRequest {
    return {
        ...request,
        baseURL: request.baseUrl
    } as DynamicFernIr.dynamic.EndpointSnippetRequest;
}
