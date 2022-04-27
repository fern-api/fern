import { HttpEndpoint } from "@fern-api/api";
import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile, ts } from "ts-morph";
import { generateErrorBodyReference } from "./generateErrorBodyReference";

export function addErrorResponse({
    endpoint,
    responseFile,
    errorsDirectory,
}: {
    endpoint: HttpEndpoint;
    responseFile: SourceFile;
    errorsDirectory: Directory;
}): void {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        {
            name: "_ok",
            type: getTextOfTsNode(ts.factory.createLiteralTypeNode(ts.factory.createFalse())),
        },
        {
            name: "statusCode",
            type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
        },
    ];

    if (endpoint.errors.possibleErrors.length > 0) {
        properties.push({
            name: "error",
            type: getTextOfTsNode(
                generateErrorBodyReference({
                    referencedIn: responseFile,
                    errors: endpoint.errors,
                    errorsDirectory,
                })
            ),
        });
    }

    responseFile.addInterface({
        name: "ErrorResponse",
        properties,
        isExported: true,
    });
}
