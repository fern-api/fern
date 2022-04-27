import { HttpEndpoint } from "@fern-api/api";
import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { TypeResolver } from "@fern-typescript/model";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile, ts } from "ts-morph";
import { generateResponseBodyReference } from "./generateResponseBodyReference";

export function addSuccessResponse({
    endpoint,
    responseFile,
    modelDirectory,
    typeResolver,
}: {
    endpoint: HttpEndpoint;
    responseFile: SourceFile;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
}): void {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        {
            name: "_ok",
            type: getTextOfTsNode(ts.factory.createLiteralTypeNode(ts.factory.createTrue())),
        },
        {
            name: "statusCode",
            type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
        },
    ];

    if (endpoint.response != null) {
        properties.push({
            name: "body",
            type: getTextOfTsNode(
                generateResponseBodyReference({
                    response: endpoint.response,
                    modelDirectory,
                    typeResolver,
                    responseFile,
                })
            ),
        });
    }

    responseFile.addInterface({
        name: "SuccessResponse",
        properties,
        isExported: true,
    });
}
