import { assertNever } from "@fern-api/core-utils";
import { SdkResponse } from "@fern-fern/ir-model/http";
import { SdkClientClassContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export function getSuccessReturnType(
    response: SdkResponse.Json | SdkResponse.FileDownload | undefined,
    context: SdkClientClassContext
): ts.TypeNode {
    if (response == null) {
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword);
    }
    switch (response.type) {
        case "fileDownload":
            return ts.factory.createTypeReferenceNode("Blob");
        case "json":
            return context.type.getReferenceToType(response.responseBodyType).typeNode;
        default:
            assertNever(response);
    }
}
