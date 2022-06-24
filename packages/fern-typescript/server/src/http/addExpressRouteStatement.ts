import { HttpEndpoint, HttpMethod, HttpPath, HttpService } from "@fern-api/api";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { ServiceTypesConstants } from "@fern-typescript/service-types";
import path from "path";
import { SourceFile, ts } from "ts-morph";
import { ServerConstants } from "../constants";
import { generateImplCall } from "./generateImplCall";
import { generateReturnFailedResponse } from "./generateReturnFailedResponse";
import { generateReturnOkResponse } from "./generateReturnOkResponse";

export function getExpressRouteStatement({
    service,
    endpoint,
    generatedEndpointTypes,
    modelContext,
    file,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    generatedEndpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
    file: SourceFile;
}): ts.Statement {
    return ts.factory.createExpressionStatement(
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(ServerConstants.Middleware.APP_VARIABLE_NAME),
                ts.factory.createIdentifier(
                    HttpMethod._visit(endpoint.method, {
                        get: () => "get",
                        post: () => "post",
                        put: () => "put",
                        patch: () => "patch",
                        delete: () => "delete",
                        _unknown: () => {
                            throw new Error("Unknown HTTP method: " + endpoint.method);
                        },
                    })
                )
            ),
            undefined,
            [
                generateExpressRoutePath({ basePath: service.basePath, endpointPath: endpoint.path }),
                ts.factory.createArrowFunction(
                    [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(
                                ServerConstants.Middleware.EndpointImplementation.Request.PARAMETER_NAME
                            )
                        ),
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(
                                ServerConstants.Middleware.EndpointImplementation.Response.PARAMETER_NAME
                            )
                        ),
                    ],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createBlock(
                        generateEndpointBody({ endpoint, generatedEndpointTypes, modelContext, file }),
                        true
                    )
                ),
            ]
        )
    );
}

function generateExpressRoutePath({
    basePath,
    endpointPath,
}: {
    basePath: string | null | undefined;
    endpointPath: HttpPath;
}): ts.Expression {
    return ts.factory.createStringLiteral(
        path.join(
            basePath ?? "/",
            endpointPath.head +
                endpointPath.parts
                    .reduce((acc, part) => {
                        return acc + `:${part.pathParameter}${part.tail}`;
                    }, "")
                    .replace(/\/+$/, "")
        )
    );
}

function generateEndpointBody({
    endpoint,
    generatedEndpointTypes,
    modelContext,
    file,
}: {
    endpoint: HttpEndpoint;
    generatedEndpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
    file: SourceFile;
}): ts.Statement[] {
    return [
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier(
                            ServerConstants.Middleware.EndpointImplementation.ImplResult.VARIABLE_NAME
                        ),
                        undefined,
                        undefined,
                        generateImplCall({ endpoint, generatedEndpointTypes, modelContext, file })
                    ),
                ],
                ts.NodeFlags.Const
            )
        ),
        ts.factory.createIfStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(ServerConstants.Middleware.EndpointImplementation.ImplResult.VARIABLE_NAME),
                ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Properties.OK)
            ),
            ts.factory.createBlock(generateReturnOkResponse(generatedEndpointTypes), true),
            ts.factory.createBlock(
                generateReturnFailedResponse({
                    endpoint,
                    generatedEndpointTypes,
                    modelContext,
                    file,
                }),
                true
            )
        ),
    ];
}
