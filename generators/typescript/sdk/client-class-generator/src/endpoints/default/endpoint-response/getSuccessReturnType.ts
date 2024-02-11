import { assertNever } from "@fern-api/core-utils";
import { HttpResponse } from "@fern-fern/ir-sdk/api";
import { JavaScriptRuntime, visitJavaScriptRuntime } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export function getSuccessReturnType(
    response: HttpResponse.Json | HttpResponse.FileDownload | HttpResponse.Streaming | undefined,
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
                targetRuntime: context.targetRuntime,
                context,
                includeContentHeadersOnResponse: opts.includeContentHeadersOnResponse,
            });
        }
        case "json":
            return context.type.getReferenceToType(response.value.responseBodyType).typeNode;
        case "streaming": {
            if (response.dataEventType.type === "text") {
                throw new Error("Cannot deserialize non-json stream data");
            }
            const dataEventType = context.type.getReferenceToType(response.dataEventType.json).typeNode;
            return context.coreUtilities.streamUtils.Stream._getReferenceToType(dataEventType);
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
    targetRuntime,
    context,
    includeContentHeadersOnResponse,
}: {
    targetRuntime: JavaScriptRuntime;
    context: SdkContext;
    includeContentHeadersOnResponse: boolean;
}): ts.TypeNode {
    const fileType = visitJavaScriptRuntime(targetRuntime, {
        browser: () => ts.factory.createTypeReferenceNode("Blob"),
        node: () => context.externalDependencies.stream.Readable._getReferenceToType(),
    });
    if (includeContentHeadersOnResponse) {
        return ts.factory.createTypeLiteralNode([
            ts.factory.createPropertySignature(
                undefined,
                READABLE_RESPONSE_KEY,
                undefined,
                context.externalDependencies.stream.Readable._getReferenceToType()
            ),
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
            ),
        ]);
    }
    return fileType;
}
