import { csharp, ast } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): ast.Type | undefined {
    if (endpoint.response?.body == null) {
        if (endpoint.method === FernIr.HttpMethod.Head) {
            return ast.Type.reference(context.getHttpResponseHeadersReference());
        }
        return undefined;
    }

    const streamResultType = {
        json: (jsonChunk: FernIr.JsonStreamChunk) =>
            ast.Type.reference(
                csharp.classReference({
                    name: "IAsyncEnumerable",
                    namespace: "System.Collections.Generic",
                    generics: [context.csharpTypeMapper.convert({ reference: jsonChunk.payload })]
                })
            ),
        text: () =>
            ast.Type.reference(
                csharp.classReference({
                    name: "IAsyncEnumerable",
                    namespace: "System.Collections.Generic",
                    generics: [ast.Type.string()]
                })
            ),

        sse: (sseChunk: FernIr.SseStreamChunk) => undefined,
        /*
            // todo: implement SSE - this is a placeholder for now
            ast.Type.reference(
                csharp.classReference({
                    name: "IAsyncEnumerable",
                    namespace: "System.Collections.Generic",
                    generics: [context.csharpTypeMapper.convert({ reference: sseChunk.payload })]
                })
            ),
            */
        _other: () => undefined
    };

    return endpoint.response.body._visit({
        streaming: (reference) => reference._visit(streamResultType),

        // endpoints that are *possibly* streaming will be implemented so they always have a stream-response
        // (this requires that consumers use `for await()` to consume the result, regardless if they are streaming or not)
        streamParameter: (reference) => reference.streamResponse._visit(streamResultType),

        fileDownload: () =>
            ast.Type.reference(
                csharp.classReference({
                    name: "Stream",
                    namespace: "System.IO",
                    fullyQualified: true
                })
            ),
        json: (reference) => context.csharpTypeMapper.convert({ reference: reference.responseBodyType }),
        text: () => ast.Type.string(),
        bytes: () => undefined,
        _other: () => undefined
    });
}
