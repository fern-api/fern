import { dynamic } from "@fern-api/ir-sdk";

export type EndpointSnippetRequest = Omit<dynamic.EndpointSnippetRequest, "baseUrl" | "endpoint" | "auth"> & {
    baseURL: string | undefined;
    endpoint: EndpointLocation;
    auth: AuthValues | undefined;
};

export type EndpointLocation = Omit<dynamic.EndpointLocation, "method"> & {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
};

export type AuthValues =
    | dynamic.AuthValues.Basic
    | dynamic.AuthValues.Bearer
    | dynamic.AuthValues.Header
    | dynamic.AuthValues.Oauth;

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertDynamicEndpointSnippetRequest(
    request: dynamic.EndpointSnippetRequest
): EndpointSnippetRequest | undefined {
    const method = request.endpoint.method;
    if (method === "HEAD") {
        return undefined;
    }
    return {
        ...request,
        baseURL: request.baseUrl,
        endpoint: {
            // TODO: Temporary workaround; remove this once we release IR v57.16.
            ...request.endpoint,
            method
        },
        auth: convertExampleAuth(request.auth)
    };
}

function convertExampleAuth(auth: dynamic.AuthValues | undefined): AuthValues | undefined {
    if (auth == null) {
        return undefined;
    }
    if (auth.type === "inferred") {
        return undefined;
    }

    return auth as AuthValues;
}
