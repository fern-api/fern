import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { assertNever } from "@fern-api/core-utils";

import { HttpResponseBody, PrimitiveTypeV1, TypeReference } from "@fern-fern/ir-sdk/api";

export function getSuccessReturnType(
    response:
        | HttpResponseBody.Json
        | HttpResponseBody.FileDownload
        | HttpResponseBody.Streaming
        | HttpResponseBody.Text
        | undefined,
    context: SdkContext,
    opts: {
        includeContentHeadersOnResponse: boolean;
    } = { includeContentHeadersOnResponse: false }
): ts.TypeNode {
    if (response == null) {
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }
    switch (response.type) {
        case "fileDownload": {
            return getFileType({
                context,
                includeContentHeadersOnResponse: opts.includeContentHeadersOnResponse
            });
        }
        case "json":
            return context.type.getReferenceToType(response.value.responseBodyType).typeNode;
        case "text":
            return context.type.getReferenceToType(
                TypeReference.primitive({ v1: PrimitiveTypeV1.String, v2: undefined })
            ).typeNode;
        case "streaming": {
            const dataEventType = response.value._visit({
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
            return context.coreUtilities.streamUtils.Stream._getReferenceToType(dataEventType.typeNode);
        }
        default:
            assertNever(response);
    }
}

export const CONTENT_LENGTH_VARIABLE_NAME = "_contentLength";
export const CONTENT_TYPE_RESPONSE_KEY = "contentType";
export const CONTENT_LENGTH_RESPONSE_KEY = "contentLengthInBytes";

function getFileType({
    context,
    includeContentHeadersOnResponse
}: {
    context: SdkContext;
    includeContentHeadersOnResponse: boolean;
}): ts.TypeNode {
    let signature = [
        ts.factory.createPropertySignature(
            [ts.factory.createToken(ts.SyntaxKind.ReadonlyKeyword)],
            ts.factory.createIdentifier("body"),
            undefined,
            ts.factory.createUnionTypeNode([
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("ReadableStream"), [
                    ts.factory.createTypeReferenceNode("Uint8Array")
                ]),
                ts.factory.createLiteralTypeNode(ts.factory.createNull())
            ])
        ),
        ts.factory.createPropertySignature(
            [ts.factory.createToken(ts.SyntaxKind.ReadonlyKeyword)],
            ts.factory.createIdentifier("bodyUsed"),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
        ),
        ts.factory.createMethodSignature(
            undefined,
            ts.factory.createIdentifier("arrayBuffer"),
            undefined,
            undefined,
            [],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                ts.factory.createTypeReferenceNode("ArrayBuffer")
            ])
        ),
        ts.factory.createMethodSignature(
            undefined,
            ts.factory.createIdentifier("blob"),
            undefined,
            undefined,
            [],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                ts.factory.createTypeReferenceNode("Blob")
            ])
        ),
        ts.factory.createMethodSignature(
            undefined,
            ts.factory.createIdentifier("bytes"),
            undefined,
            undefined,
            [],
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
                ts.factory.createTypeReferenceNode("Uint8Array")
            ])
        )
    ];
    if (includeContentHeadersOnResponse) {
        signature = [
            ...signature,
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
        ];
    }

    return ts.factory.createTypeLiteralNode(signature);
}
