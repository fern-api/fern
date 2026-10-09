import { ast } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";

type HttpEndpoint = FernIr.HttpEndpoint;

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

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

/**
 * Returns the non-generic WithRawResponseTask for void-returning endpoints.
 */
function nonGenericWithRawResponseTask(context: SdkGeneratorContext): ast.Type {
    return context.generation.csharp.classReference({
        name: "WithRawResponseTask",
        namespace: context.namespaces.root
    });
}

/**
 * Wraps the inner element type in WithRawResponseStream<T> for streaming endpoints.
 */
function wrapWithRawResponseStream(context: SdkGeneratorContext, elementType: ast.Type): ast.Type {
    return context.generation.csharp.classReference({
        name: "WithRawResponseStream",
        namespace: context.namespaces.root,
        generics: [elementType]
    });
}

export function getEndpointReturnType({
    context,
    endpoint,
    isGrpc
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
    isGrpc?: boolean;
}): ast.Type | undefined {
    if (endpoint.response?.body == null) {
        if (endpoint.method === FernIr.HttpMethod.Head) {
            // Wrap HEAD response in WithRawResponseTask for consistency
            return wrapWithRawResponseTask(context, context.System.Net.Http.HttpResponseHeaders);
        }
        // Void-returning endpoints: wrap in non-generic WithRawResponseTask so callers can reach .WithRawResponse()
        // gRPC endpoints don't carry response headers/trailers, so they keep returning Task directly.
        if (isGrpc) {
            return undefined;
        }
        return nonGenericWithRawResponseTask(context);
    }

    // Streaming endpoints: wrap the element type in WithRawResponseStream<T>.
    // gRPC streaming keeps the legacy IAsyncEnumerable<T> shape (no raw-response surface).
    if (isStreamingEndpoint(endpoint) && !isGrpc) {
        const elementType = getStreamElementType(context, endpoint);
        if (elementType != null) {
            return wrapWithRawResponseStream(context, elementType);
        }
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

    // Wrap non-streaming, non-gRPC responses in WithRawResponseTask<T>.
    // gRPC endpoints don't support response headers/trailers, so they return Task<T> directly.
    if (baseType != null && !isStreamingEndpoint(endpoint) && !isGrpc) {
        return wrapWithRawResponseTask(context, baseType);
    }

    return baseType;
}

/**
 * Returns the element type T for a streaming endpoint's IAsyncEnumerable<T>, or undefined for non-streaming endpoints.
 */
export function getStreamElementType(context: SdkGeneratorContext, endpoint: HttpEndpoint): ast.Type | undefined {
    if (endpoint.response?.body == null) {
        return undefined;
    }
    const streamElementType = {
        json: (jsonChunk: FernIr.JsonStreamChunk) => context.csharpTypeMapper.convert({ reference: jsonChunk.payload }),
        text: () => context.generation.Primitive.string,
        sse: (sseChunk: FernIr.SseStreamChunk) => context.csharpTypeMapper.convert({ reference: sseChunk.payload }),
        _other: () => undefined
    };
    return endpoint.response.body._visit<ast.Type | undefined>({
        streaming: (reference) => reference._visit(streamElementType),
        streamParameter: (reference) => reference.streamResponse._visit(streamElementType),
        fileDownload: () => undefined,
        json: () => undefined,
        text: () => undefined,
        bytes: () => undefined,
        _other: () => undefined
    });
}

export function isStreamingEndpoint(endpoint: HttpEndpoint): boolean {
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
