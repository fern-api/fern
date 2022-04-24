import { HttpEndpoint } from "@fern-api/api";
import { getTextOfTsKeyword, getTextOfTsNode } from "@fern-api/typescript-commons";
import { Directory, SourceFile, ts, Writers } from "ts-morph";

export function generateEndpointFile({
    endpoint,
    file,
    errorsDirectory,
}: {
    endpoint: HttpEndpoint;
    file: SourceFile;
    errorsDirectory: Directory;
    modelDirectory: Directory;
}): void {
    file.addInterface({
        name: "Request",
    });

    file.addTypeAlias({
        name: "Response",
        type: Writers.unionType("SuccessResponse", "ErrorResponse"),
    });

    file.addInterface({
        name: "SuccessResponse",
        extends: ["BaseResponse"],
        properties: [
            {
                name: "ok",
                type: getTextOfTsNode(ts.factory.createTrue()),
            },
        ],
    });

    file.addInterface({
        name: "ErrorResponse",
        extends: ["BaseResponse"],
        properties: [
            {
                name: "ok",
                type: getTextOfTsNode(ts.factory.createFalse()),
            },
            // TODO only if there's endpoints.errors.length > 0
            {
                name: "error",
                type: "Error",
            },
            {
                name: "visit",
                type: getTextOfTsNode(
                    ts.factory.createFunctionTypeNode(
                        [ts.factory.createTypeParameterDeclaration(ts.factory.createIdentifier("R"))],
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                ts.factory.createIdentifier("visitor"),
                                undefined,
                                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("ErrorVisitor"), [
                                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("R"), undefined),
                                ])
                            ),
                        ],
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("R"), undefined)
                    )
                ),
            },
        ],
    });

    file.addInterface({
        name: "BaseResponse",
        properties: [
            {
                name: "statusCode",
                type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
            },
            {
                name: "body",
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
        ],
    });

    const [firstErrorType, secondErrorType, ...restOfErrorTypes] = endpoint.errors.possibleErrors.map((error) =>
        getTextOfTsNode(
            ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier("errors"),
                    ts.factory.createIdentifier(error.error.name)
                )
            )
        )
    );
    if (firstErrorType != null) {
        file.addImportDeclaration({
            moduleSpecifier: file.getRelativePathAsModuleSpecifierTo(errorsDirectory.getPath()),
            namespaceImport: "errors",
        });
        file.addTypeAlias({
            name: "Error",
            type:
                secondErrorType == null
                    ? firstErrorType
                    : Writers.unionType(firstErrorType, secondErrorType, ...restOfErrorTypes),
        });

        file.addInterface({
            name: "ErrorVisitor",
            typeParameters: ["R"],
            properties: endpoint.errors.possibleErrors.map((error) => ({
                name: error.discriminantValue,
                type: getTextOfTsNode(
                    ts.factory.createFunctionTypeNode(
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                undefined,
                                "error",
                                undefined,
                                ts.factory.createTypeReferenceNode(
                                    ts.factory.createQualifiedName(
                                        ts.factory.createIdentifier("errors"),
                                        ts.factory.createIdentifier(error.error.name)
                                    )
                                )
                            ),
                        ],
                        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("ErrorVisitor"), [
                            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("R"), undefined),
                        ])
                    )
                ),
            })),
        });
    }
}
