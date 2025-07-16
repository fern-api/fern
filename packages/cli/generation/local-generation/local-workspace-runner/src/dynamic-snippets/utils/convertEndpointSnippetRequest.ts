import { dynamic } from "@fern-api/ir-sdk"

export type EndpointSnippetRequest = Omit<dynamic.EndpointSnippetRequest, "baseUrl" | "endpoint"> & {
    baseURL: string | undefined
    endpoint: EndpointLocation
}

export type EndpointLocation = Omit<dynamic.EndpointLocation, "method"> & {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
}

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertDynamicEndpointSnippetRequest(
    request: dynamic.EndpointSnippetRequest
): EndpointSnippetRequest | undefined {
    const method = request.endpoint.method
    if (method === "HEAD") {
        return undefined
    }
    return {
        ...request,
        baseURL: request.baseUrl,
        endpoint: {
            // TODO: Temporary workaround; remove this once we release IR v57.16.
            ...request.endpoint,
            method
        }
    }
}
