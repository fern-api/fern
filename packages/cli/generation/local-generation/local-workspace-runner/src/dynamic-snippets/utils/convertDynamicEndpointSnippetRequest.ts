import { dynamic } from "@fern-api/ir-sdk";

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertDynamicEndpointSnippetRequest(request: dynamic.EndpointSnippetRequest): Omit<
    dynamic.EndpointSnippetRequest,
    "baseUrl"
> & {
    baseURL: string | undefined;
} {
    return {
        ...request,
        baseURL: request.baseUrl
    };
}