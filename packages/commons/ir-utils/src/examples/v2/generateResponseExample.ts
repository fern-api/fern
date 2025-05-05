import { assertNever } from "@fern-api/core-utils";
import {
    HttpEndpoint,
    TypeDeclaration,
    TypeId,
    V2HttpEndpointResponse,
    V2HttpEndpointResponseBody
} from "@fern-api/ir-sdk";

import { getFirstExamples } from "./getFirstExamples";

export function generateResponseExample({
    endpoint,
    typeDeclarations,
    skipOptionalRequestProperties
}: {
    endpoint: HttpEndpoint;
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    skipOptionalRequestProperties: boolean;
}): V2HttpEndpointResponse {
    const result: V2HttpEndpointResponse = {
        statusCode: endpoint.response?.statusCode,
        body: undefined,
        docs: undefined
    };
    if (endpoint.response == null) {
        return result;
    }

    if (endpoint.response.body == null) {
        // For OpenRPC endpoints with no body, still return a JSON-RPC response format
        if (endpoint.source?.type === "openrpc") {
            result.body = V2HttpEndpointResponseBody.json(wrapAsJsonRpcResponse(null));
        }
        return result;
    }
    switch (endpoint.response.body.type) {
        case "bytes":
            break;
        case "fileDownload":
            break;
        case "text":
            break;
        case "json": {
            const jsonBody = endpoint.response.body.value;
            if (jsonBody.type === "response") {
                const { userExample, autoExample } = getFirstExamples(jsonBody.v2Examples);
                const example = userExample ?? autoExample;
                if (example !== undefined) {
                    const responseExample =
                        endpoint.source?.type === "openrpc" ? wrapAsJsonRpcResponse(example) : example;
                    result.body = V2HttpEndpointResponseBody.json(responseExample);
                }
            }
            break;
        }
        case "streaming":
            break;
        case "streamParameter":
            break;
        default: {
            assertNever(endpoint.response.body);
        }
    }
    return result;
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
