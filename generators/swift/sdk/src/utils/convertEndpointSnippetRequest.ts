import { dynamic } from "@fern-api/ir-sdk";

export type EndpointSnippetRequest = Omit<dynamic.EndpointSnippetRequest, "baseUrl"> & {
    baseURL: string | undefined;
};

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertDynamicEndpointSnippetRequest(
    request: dynamic.EndpointSnippetRequest,
    { baseUrlFallback }: { baseUrlFallback?: string } = {}
): EndpointSnippetRequest {
    return {
        ...request,
        baseURL: request.baseUrl ?? baseUrlFallback
    };
}
