import { assertNever, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { HttpEndpoint, HttpResponseBody, PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { getReadableTypeNode } from "../../../getReadableTypeNode";

export function getSuccessReturnType(
    endpoint: HttpEndpoint,
    response:
        | HttpResponseBody.Json
        | HttpResponseBody.FileDownload
        | HttpResponseBody.Streaming
        | HttpResponseBody.Text
        | undefined,
    context: SdkContext,
    opts: {
        includeContentHeadersOnResponse: boolean;
        streamType: "wrapper" | "web";
        fileResponseType: "stream" | "binary-response";
    }
): ts.TypeNode {
    if (response == null) {
        if (endpoint.method === "HEAD") {
            return ts.factory.createTypeReferenceNode("Headers");
        }
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }
    switch (response.type) {
        case "fileDownload": {
            return getFileType({
                context,
                includeContentHeadersOnResponse: opts.includeContentHeadersOnResponse,
                streamType: opts.streamType,
                fileResponseType: opts.fileResponseType
            });
        }
        case "json": {
            const returnType = context.type.getReferenceToType(response.value.responseBodyType);
            return returnType.responseTypeNode ?? returnType.typeNode;
        }
        case "text":
            return context.type.getReferenceToType(
                TypeReference.primitive({ v1: PrimitiveTypeV1.String, v2: undefined })
            ).typeNode;
        case "streaming": {
            const dataEventType = visitDiscriminatedUnion(response.value)._visit({
                json: (json) => context.type.getReferenceToType(json.payload),
                sse: (sse) => context.type.getReferenceToType(sse.payload),
                text: () =>
                    context.type.getReferenceToType(
                        TypeReference.primitive({ v1: PrimitiveTypeV1.String, v2: undefined })
                    ),
                _other: ({ type }) => {
                    throw new Error(`Encountered unknown data event type ${type}`);
                }
            });
            return context.coreUtilities.stream.Stream._getReferenceToType(
                dataEventType.responseTypeNode ?? dataEventType.typeNode
            );
        }
        default:
            assertNever(response);
    }
}

export const CONTENT_LENGTH_VARIABLE_NAME = "_contentLength";
export const READABLE_RESPONSE_KEY = "data";
export const CONTENT_TYPE_RESPONSE_KEY = "contentType";
export const CONTENT_LENGTH_RESPONSE_KEY = "contentLengthInBytes";

function getFileType({
    context,
    includeContentHeadersOnResponse,
    streamType,
    fileResponseType
}: {
    context: SdkContext;
    includeContentHeadersOnResponse: boolean;
    streamType: "wrapper" | "web";
    fileResponseType: "stream" | "binary-response";
}): ts.TypeNode {
    const fileType = (() => {
        switch (fileResponseType) {
            case "stream":
                return getReadableTypeNode({
                    typeArgument: ts.factory.createTypeReferenceNode("Uint8Array"),
                    context,
                    streamType
                });
            case "binary-response":
                return context.coreUtilities.fetcher.BinaryResponse._getReferenceToType();
            default:
                assertNever(fileResponseType);
        }
    })();
    if (!includeContentHeadersOnResponse) {
        return fileType;
    }
    return ts.factory.createTypeLiteralNode([
        ts.factory.createPropertySignature(undefined, READABLE_RESPONSE_KEY, undefined, fileType),
        ts.factory.createPropertySignature(
            undefined,
            CONTENT_LENGTH_RESPONSE_KEY,
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
        ),
        ts.factory.createPropertySignature(
            undefined,
            CONTENT_TYPE_RESPONSE_KEY,
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        )
    ]);
}
