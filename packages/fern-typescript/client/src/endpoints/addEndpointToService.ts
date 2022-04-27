import { HttpEndpoint } from "@fern-api/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { TypeResolver } from "@fern-typescript/model";
import { ClassDeclaration, Directory, InterfaceDeclaration, Scope, SourceFile, ts } from "ts-morph";
import { generateJoinPathsCall } from "../utils/generateJoinPathsCall";
import { createEndpointSignature } from "./signature/createEndpointSignature";

export function addEndpointToService({
    endpoint,
    serviceInterface,
    serviceClass,
    modelDirectory,
    errorsDirectory,
    typeResolver,
}: {
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    typeResolver: TypeResolver;
}): void {
    const signature = createEndpointSignature({
        endpoint,
        serviceFile: serviceInterface.getSourceFile(),
        modelDirectory,
        errorsDirectory,
        typeResolver,
    });

    serviceInterface.addProperty({
        name: endpoint.endpointId,
        type: getTextOfTsNode(ts.factory.createFunctionTypeNode(undefined, signature.parameters, signature.returnType)),
    });

    serviceClass.addProperty({
        name: endpoint.endpointId,
        scope: Scope.Public,
        initializer: getTextOfTsNode(
            ts.factory.createArrowFunction(
                [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                undefined,
                signature.parameters.map((parameter) =>
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        parameter.name,
                        undefined,
                        parameter.type
                    )
                ),
                signature.returnType,
                undefined,
                ts.factory.createBlock(
                    [
                        generateFetcherCall({ serviceFile: serviceClass.getSourceFile(), endpoint }),
                        generateReturnResponse(endpoint),
                    ],
                    true
                )
            )
        ),
    });
}

function generateFetcherCall({
    serviceFile,
    endpoint,
}: {
    serviceFile: SourceFile;
    endpoint: HttpEndpoint;
}): ts.VariableStatement {
    const fetcherArgs: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier("url"),
            generateJoinPathsCall({
                file: serviceFile,
                paths: [
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        ts.factory.createIdentifier("baseUrl")
                    ),
                    ts.factory.createStringLiteral(endpoint.path),
                ],
            })
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier("method"),
            ts.factory.createStringLiteral(endpoint.method)
        ),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier("headers"),
            ts.factory.createObjectLiteralExpression([], false)
        ),
    ];
    if (endpoint.request != null) {
        fetcherArgs.push(
            ts.factory.createShorthandPropertyAssignment(ts.factory.createIdentifier("request"), undefined)
        );
    }

    return ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
            [
                ts.factory.createVariableDeclaration(
                    ts.factory.createIdentifier("response"),
                    undefined,
                    undefined,
                    ts.factory.createAwaitExpression(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createThis(),
                                ts.factory.createIdentifier("fetcher")
                            ),
                            undefined,
                            [ts.factory.createObjectLiteralExpression(fetcherArgs, true)]
                        )
                    )
                ),
            ],
            ts.NodeFlags.Const | ts.NodeFlags.AwaitContext | ts.NodeFlags.ContextFlags | ts.NodeFlags.TypeExcludesFlags
        )
    );
}

function generateReturnResponse(endpoint: HttpEndpoint): ts.IfStatement {
    return ts.factory.createIfStatement(
        isStatusCodeOk(),
        ts.factory.createBlock([returnSuccessResponse(endpoint)], true),
        ts.factory.createBlock([returnErrorResponse(endpoint)], true)
    );
}

function isStatusCodeOk() {
    return ts.factory.createBinaryExpression(
        ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("response"),
                ts.factory.createIdentifier("statusCode")
            ),
            ts.factory.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
            ts.factory.createNumericLiteral("200")
        ),
        ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("response"),
                ts.factory.createIdentifier("statusCode")
            ),
            ts.factory.createToken(ts.SyntaxKind.LessThanToken),
            ts.factory.createNumericLiteral("300")
        )
    );
}

function returnSuccessResponse(endpoint: HttpEndpoint) {
    const properties: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(ts.factory.createIdentifier("_ok"), ts.factory.createTrue()),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier("statusCode"),
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("response"),
                ts.factory.createIdentifier("statusCode")
            )
        ),
    ];

    if (endpoint.response != null) {
        properties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("body"),
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("response"),
                    ts.factory.createIdentifier("body")
                )
            )
        );
    }

    return ts.factory.createReturnStatement(ts.factory.createObjectLiteralExpression(properties, true));
}

function returnErrorResponse(endpoint: HttpEndpoint) {
    const properties: ts.ObjectLiteralElementLike[] = [
        ts.factory.createPropertyAssignment(ts.factory.createIdentifier("_ok"), ts.factory.createFalse()),
        ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier("statusCode"),
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("response"),
                ts.factory.createIdentifier("statusCode")
            )
        ),
    ];

    if (endpoint.errors.possibleErrors.length > 0) {
        properties.push(
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("error"),
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("response"),
                    ts.factory.createIdentifier("body")
                )
            )
        );
    }

    return ts.factory.createReturnStatement(ts.factory.createObjectLiteralExpression(properties, true));
}
