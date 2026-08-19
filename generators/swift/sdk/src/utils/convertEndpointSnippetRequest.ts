import { FernIr } from "@fern-fern/ir-sdk";
export type EndpointSnippetRequest = Omit<FernIr.dynamic.EndpointSnippetRequest, "baseUrl"> & {
    baseURL: string | undefined;
};

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertDynamicEndpointSnippetRequest(
    request: FernIr.dynamic.EndpointSnippetRequest,
    { baseUrlFallback }: { baseUrlFallback?: string } = {}
): EndpointSnippetRequest {
    return {
        ...request,
        baseURL: request.baseUrl ?? baseUrlFallback
    };
}
