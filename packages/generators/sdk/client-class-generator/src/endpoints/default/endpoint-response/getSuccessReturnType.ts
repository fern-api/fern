import { assertNever } from "@fern-api/core-utils";
import { HttpResponse } from "@fern-fern/ir-sdk/api";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export function getSuccessReturnType(
    response: HttpResponse.Json | HttpResponse.FileDownload | undefined,
    context: SdkContext
): ts.TypeNode {
    if (response == null) {
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }
    switch (response.type) {
        case "fileDownload":
            return ts.factory.createTypeReferenceNode("Blob");
        case "json":
            return context.type.getReferenceToType(response.value.responseBodyType).typeNode;
        default:
            assertNever(response);
    }
}
