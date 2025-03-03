import { dynamic } from "@fern-api/ir-sdk";
import { AuthValues, convertAuthValues } from "./convertAuthValues";

export type EndpointSnippetRequest = Omit<
    dynamic.EndpointSnippetRequest,
    "auth" | "baseUrl"
> & {
    auth: AuthValues | undefined;
    baseURL: string | undefined;
};

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertDynamicEndpointSnippetRequest(request: dynamic.EndpointSnippetRequest): EndpointSnippetRequest {
    return {
        ...request,
        auth: request.auth != null ? convertAuthValues(request.auth) : undefined,
        baseURL: request.baseUrl
    };
}