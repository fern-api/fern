import { csharp } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): csharp.Type | undefined {
    if (endpoint.response?.body == null) {
        if (endpoint.method === FernIr.HttpMethod.Head) {
            return csharp.Type.reference(context.getHttpResponseHeadersReference());
        }
        return undefined;
    }

    const streamResultType = {
        json: (jsonChunk: FernIr.JsonStreamChunk) =>
            csharp.Type.reference(
                csharp.classReference({
                    name: "IAsyncEnumerable",
                    namespace: "System.Collections.Generic",
                    generics: [context.csharpTypeMapper.convert({ reference: jsonChunk.payload })]
                })
            ),
        text: () =>
            csharp.Type.reference(
                csharp.classReference({
                    name: "IAsyncEnumerable",
                    namespace: "System.Collections.Generic",
                    generics: [csharp.Type.string()]
                })
            ),

        sse: (sseChunk: FernIr.SseStreamChunk) => undefined,
        /*
            // todo: implement SSE - this is a placeholder for now
            csharp.Type.reference(
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
            csharp.Type.reference(
                csharp.classReference({
                    name: "Stream",
                    namespace: "System.IO",
                    fullyQualified: true
                })
            ),
        json: (reference) => context.csharpTypeMapper.convert({ reference: reference.responseBodyType }),
        text: () => csharp.Type.string(),
        bytes: () => undefined,
        _other: () => undefined
    });
}
