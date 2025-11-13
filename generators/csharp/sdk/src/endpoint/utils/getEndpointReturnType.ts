import { ast } from "@fern-api/csharp-codegen";

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
            return context.System.Net.Http.HttpResponseHeaders;
        }
        return undefined;
    }

    const streamResultType = {
        json: (jsonChunk: FernIr.JsonStreamChunk) =>
            context.System.Collections.Generic.IAsyncEnumerable(
                context.csharpTypeMapper.convert({ reference: jsonChunk.payload })
            ),
        text: () => context.System.Collections.Generic.IAsyncEnumerable(context.generation.Primitive.string),
        sse: (sseChunk: FernIr.SseStreamChunk) =>
            context.System.Collections.Generic.IAsyncEnumerable(
                context.csharpTypeMapper.convert({ reference: sseChunk.payload })
            ),
        _other: () => undefined
    };

    return endpoint.response.body._visit<ast.Type | undefined>({
        streaming: (reference) => reference._visit(streamResultType),
        // endpoints that are *possibly* streaming will be implemented so they always have a stream-response
        // (this requires that consumers use `for await()` to consume the result, regardless if they are streaming or not)
        streamParameter: (reference) => reference.streamResponse._visit(streamResultType),
        fileDownload: () => context.System.IO.Stream.asFullyQualified(),
        json: (reference) => context.csharpTypeMapper.convert({ reference: reference.responseBodyType }),
        text: () => context.generation.Primitive.string,
        bytes: () => undefined,
        _other: () => undefined
    });
}
