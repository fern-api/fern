import { ExampleEndpointCall, HttpEndpoint, dynamic } from "@fern-fern/ir-sdk/api";

export type EndpointSnippetRequest = Omit<dynamic.EndpointSnippetRequest, "baseUrl"> & {
    baseURL: string | undefined;
};

/**
 * The @fern-api/dynamic-ir-sdk doesn't include the serialization layer, so the casing
 * convention doesn't match.
 */
export function convertDynamicEndpointSnippetRequest(request: dynamic.EndpointSnippetRequest): EndpointSnippetRequest {
    return {
        ...request,
        baseURL: request.baseUrl
    };
}

/**
 * Converts an ExampleEndpointCall from the IR to a dynamic.EndpointSnippetRequest
 * that can be used for snippet generation.
 */
export function convertExampleEndpointCallToSnippetRequest(
    example: ExampleEndpointCall,
    endpoint: HttpEndpoint
): dynamic.EndpointSnippetRequest {
    // Create endpoint location from the HttpEndpoint
    let path = endpoint.fullPath.head;
    for (const part of endpoint.fullPath.parts) {
        path += `{${part.pathParameter}}${part.tail}`;
    }

    const endpointLocation: dynamic.EndpointLocation = {
        method: endpoint.method,
        path
    };

    const pathParameters: Record<string, unknown> = {};
    [...example.rootPathParameters, ...example.servicePathParameters, ...example.endpointPathParameters].forEach(
        (param) => {
            pathParameters[param.name.originalName] = param.value.jsonExample;
        }
    );

    const queryParameters: Record<string, unknown> = {};
    example.queryParameters.forEach((param) => {
        queryParameters[param.name.wireValue] = param.value.jsonExample;
    });

    const headers: Record<string, unknown> = {};
    [...example.serviceHeaders, ...example.endpointHeaders].forEach((header) => {
        headers[header.name.wireValue] = header.value.jsonExample;
    });

    return {
        endpoint: endpointLocation,
        baseUrl: undefined,
        environment: undefined,
        auth: undefined,
        pathParameters: Object.keys(pathParameters).length > 0 ? pathParameters : undefined,
        queryParameters: Object.keys(queryParameters).length > 0 ? queryParameters : undefined,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        requestBody: example.request?.jsonExample
    };
}
