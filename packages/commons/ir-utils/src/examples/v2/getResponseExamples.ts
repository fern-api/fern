import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, V2HttpEndpointResponse, V2HttpEndpointResponseBody, V2SchemaExample } from "@fern-api/ir-sdk";

import { getV2Examples } from "./getV2Examples";

export function getResponseExamples({ endpoint }: { endpoint: HttpEndpoint }): {
    userResponseExamples: Record<string, V2HttpEndpointResponse>;
    autoResponseExamples: Record<string, V2HttpEndpointResponse>;
    baseExample: V2HttpEndpointResponse;
} {
    const userResponseExamples: Record<string, V2HttpEndpointResponse> = {};
    const autoResponseExamples: Record<string, V2HttpEndpointResponse> = {};
    const baseResponseExample: V2HttpEndpointResponse = {
        statusCode: endpoint.response?.statusCode,
        body: undefined,
        docs: undefined
    };
    if (endpoint.response == null) {
        return {
            userResponseExamples: {},
            autoResponseExamples: {},
            baseExample: baseResponseExample
        };
    }

    if (endpoint.response.body == null) {
        // For OpenRPC endpoints with no body, still return a JSON-RPC response format
        if (endpoint.source?.type === "openrpc") {
            return {
                userResponseExamples: {},
                autoResponseExamples: {},
                baseExample: {
                    ...baseResponseExample,
                    body: V2HttpEndpointResponseBody.json(wrapAsJsonRpcResponse(null))
                }
            };
        }
        return {
            userResponseExamples: {},
            autoResponseExamples: {},
            baseExample: baseResponseExample
        };
    }
    switch (endpoint.response.body.type) {
        case "bytes":
            break;
        case "fileDownload":
            break;
        case "text": {
            const textBody = endpoint.response.body;
            const { userExamples, autoExamples } = getV2Examples(textBody.v2Examples);
            for (const [name, example] of Object.entries(userExamples)) {
                const wrappedExample = endpoint.source?.type === "openrpc" ? wrapAsJsonRpcResponse(example) : example;
                userResponseExamples[name] = {
                    ...baseResponseExample,
                    body: V2HttpEndpointResponseBody.json(wrappedExample)
                };
            }
            for (const [name, example] of Object.entries(autoExamples)) {
                const wrappedExample = endpoint.source?.type === "openrpc" ? wrapAsJsonRpcResponse(example) : example;
                autoResponseExamples[name] = {
                    ...baseResponseExample,
                    body: V2HttpEndpointResponseBody.json(wrappedExample)
                };
            }
            break;
        }
        case "json": {
            const jsonBody = endpoint.response.body.value;
            if (jsonBody.type === "response") {
                const { userExamples, autoExamples } = getV2Examples(jsonBody.v2Examples);
                for (const [name, example] of Object.entries(userExamples)) {
                    const wrappedExample =
                        endpoint.source?.type === "openrpc" ? wrapAsJsonRpcResponse(example) : example;
                    userResponseExamples[name] = {
                        ...baseResponseExample,
                        body: V2HttpEndpointResponseBody.json(wrappedExample)
                    };
                }
                for (const [name, example] of Object.entries(autoExamples)) {
                    const wrappedExample =
                        endpoint.source?.type === "openrpc" ? wrapAsJsonRpcResponse(example) : example;
                    autoResponseExamples[name] = {
                        ...baseResponseExample,
                        body: V2HttpEndpointResponseBody.json(wrappedExample)
                    };
                }
            }
            break;
        }
        case "streaming": {
            const jsonBody = endpoint.response.body.value;
            if (jsonBody.type === "json") {
                const { userExamples, autoExamples } = getV2Examples(jsonBody.v2Examples);
                for (const [name, example] of Object.entries(userExamples)) {
                    userResponseExamples[name] = {
                        ...baseResponseExample,
                        body: V2HttpEndpointResponseBody.stream([example])
                    };
                }
                for (const [name, example] of Object.entries(autoExamples)) {
                    autoResponseExamples[name] = {
                        ...baseResponseExample,
                        body: V2HttpEndpointResponseBody.stream([example])
                    };
                }
            }
            break;
        }
        case "streamParameter":
            break;
        default: {
            assertNever(endpoint.response.body);
        }
    }
    return {
        userResponseExamples,
        autoResponseExamples,
        baseExample: baseResponseExample
    };
}

/**
 * Wraps a payload in a JSON-RPC 2.0 response format
 *
 * @param payload The result payload to wrap
 * @param id Optional request ID (defaults to 1)
 * @returns A formatted JSON-RPC 2.0 response object
 */
export function wrapAsJsonRpcResponse(payload: unknown, id: number = 1): unknown {
    return {
        id,
        jsonrpc: "2.0",
        result: payload
    };
}
