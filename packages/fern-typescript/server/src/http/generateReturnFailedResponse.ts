import { HttpEndpoint } from "@fern-fern/ir-model/services";
import { visitorUtils } from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { ServiceTypesConstants } from "@fern-typescript/service-types";
import { SourceFile, ts } from "ts-morph";
import { ServerConstants } from "../constants";

const STATUS_CODE_LOCAL_VARIABLE = "statusCode";

const DEFAULT_STATUS_CODE = 500;

export function generateReturnFailedResponse({
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
    if (endpoint.errors.length === 0) {
        return [
            ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(
                            ServerConstants.Middleware.EndpointImplementation.Response.PARAMETER_NAME
                        ),
                        ts.factory.createIdentifier(ServerConstants.Express.ResponseMethods.SEND_STATUS)
                    ),
                    undefined,
                    [ts.factory.createNumericLiteral(DEFAULT_STATUS_CODE)]
                )
            ),
        ];
    }
    return [
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        ts.factory.createIdentifier(STATUS_CODE_LOCAL_VARIABLE),
                        undefined,
                        undefined,
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                modelContext.getReferenceToHttpServiceTypeUtils({
                                    reference: generatedEndpointTypes.response.errorBodyReference,
                                    referencedIn: file,
                                }),
                                ts.factory.createIdentifier(visitorUtils.VISIT_PROPERTY_NAME)
                            ),
                            undefined,
                            [
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier(
                                        ServerConstants.Middleware.EndpointImplementation.ImplResult.VARIABLE_NAME
                                    ),
                                    ts.factory.createIdentifier(
                                        ServiceTypesConstants.Commons.Response.Error.Properties.Body.PROPERTY_NAME
                                    )
                                ),
                                ts.factory.createObjectLiteralExpression(
                                    [
                                        ...endpoint.errors.map((error) => {
                                            const errorDeclaration = modelContext.getErrorDeclarationFromName(
                                                error.error
                                            );
                                            return ts.factory.createPropertyAssignment(
                                                ts.factory.createIdentifier(
                                                    modelContext.getErrorDeclarationFromName(error.error)
                                                        .discriminantValue.wireValue
                                                ),
                                                ts.factory.createArrowFunction(
                                                    undefined,
                                                    undefined,
                                                    [],
                                                    undefined,
                                                    undefined,
                                                    ts.factory.createNumericLiteral(
                                                        errorDeclaration.http != null
                                                            ? errorDeclaration.http.statusCode
                                                            : DEFAULT_STATUS_CODE
                                                    )
                                                )
                                            );
                                        }),
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier(visitorUtils.UNKNOWN_PROPERY_NAME),
                                            ts.factory.createArrowFunction(
                                                undefined,
                                                undefined,
                                                [],
                                                undefined,
                                                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                                ts.factory.createNumericLiteral(DEFAULT_STATUS_CODE)
                                            )
                                        ),
                                    ],
                                    true
                                ),
                            ]
                        )
                    ),
                ],
                ts.NodeFlags.Const
            )
        ),
        ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(
                                ServerConstants.Middleware.EndpointImplementation.Response.PARAMETER_NAME
                            ),
                            ts.factory.createIdentifier(ServerConstants.Express.ResponseMethods.STATUS)
                        ),
                        undefined,
                        [ts.factory.createIdentifier(STATUS_CODE_LOCAL_VARIABLE)]
                    ),
                    ts.factory.createIdentifier(ServerConstants.Express.ResponseMethods.SEND)
                ),
                undefined,
                [
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(
                            ServerConstants.Middleware.EndpointImplementation.ImplResult.VARIABLE_NAME
                        ),
                        ts.factory.createIdentifier(
                            ServiceTypesConstants.Commons.Response.Error.Properties.Body.PROPERTY_NAME
                        )
                    ),
                ]
            )
        ),
    ];
}
