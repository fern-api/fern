import { ast } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

/**
 * Wraps a type in WithRawResponseTask<T> for non-streaming endpoints.
 */
function wrapWithRawResponseTask(context: SdkGeneratorContext, innerType: ast.Type): ast.Type {
    return context.generation.csharp.classReference({
        name: "WithRawResponseTask",
        namespace: context.namespaces.root,
        generics: [innerType]
    });
}

export function getEndpointReturnType({
    context,
    endpoint
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
}): ast.Type | undefined {
    if (endpoint.response?.body == null) {
        if (endpoint.method === FernIr.HttpMethod.Head) {
            // Wrap HEAD response in WithRawResponseTask for consistency
            return wrapWithRawResponseTask(context, context.System.Net.Http.HttpResponseHeaders);
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

    const baseType = endpoint.response.body._visit<ast.Type | undefined>({
        streaming: (reference) => reference._visit(streamResultType),
        // endpoints that are *possibly* streaming will be implemented so they always have a stream-response
        // (this requires that consumers use `for await()` to consume the result, regardless if they are streaming or not)
        streamParameter: (reference) => reference.streamResponse._visit(streamResultType),
        fileDownload: () => context.System.IO.Stream.asFullyQualified(),
        json: (reference) =>
            context.csharpTypeMapper.convert({
                reference: reference.responseBodyType
            }),
        text: () => context.generation.Primitive.string,
        bytes: () => undefined,
        _other: () => undefined
    });

    // Wrap non-streaming responses in WithRawResponseTask<T>
    if (baseType != null && !isStreamingEndpoint(endpoint)) {
        return wrapWithRawResponseTask(context, baseType);
    }

    return baseType;
}

function isStreamingEndpoint(endpoint: HttpEndpoint): boolean {
    if (endpoint.response?.body == null) {
        return false;
    }

    return endpoint.response.body._visit({
        streaming: () => true,
        streamParameter: () => true,
        fileDownload: () => false,
        json: () => false,
        text: () => false,
        bytes: () => false,
        _other: () => false
    });
}
