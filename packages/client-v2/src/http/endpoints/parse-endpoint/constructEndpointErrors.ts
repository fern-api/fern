import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { getTextOfTsNode, getWriterForMultiLineUnionType, visitorUtils } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";
import { ModuleDeclaration, PropertySignature, ts } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { ClientEndpointError } from "./ParsedClientEndpoint";

export function constructEndpointErrors({
    service,
    endpoint,
    file,
    endpointModule,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    file: File;
    endpointModule: ModuleDeclaration;
}): ClientEndpointError {
    const referenceToService = file.getReferenceToService(service.name);
    const referenceToEndpointModule = ts.factory.createQualifiedName(
        referenceToService.entityName,
        ts.factory.createIdentifier(endpointModule.getName())
    );

    const errorType = endpointModule.addInterface({
        name: "Error",
        isExported: true,
    });

    const referenceToErrorType = ts.factory.createQualifiedName(referenceToEndpointModule, errorType.getName());

    const errorBodyType = endpointModule.addTypeAlias({
        name: "ErrorBody",
        isExported: true,
        type: getWriterForMultiLineUnionType([
            ...endpoint.errors.map((error) => ({
                node: file.getReferenceToError(error.error),
                docs: error.docs,
            })),
            {
                docs: undefined,
                node: file.externalDependencies.serviceUtils.NetworkError._getReferenceToType(),
            },
            {
                docs: undefined,
                node: file.externalDependencies.serviceUtils.UnknownError._getReferenceToType(),
            },
        ]),
    });

    const referenceToErrorBodyType = ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(referenceToEndpointModule, errorBodyType.getName())
    );

    const errorBodyProperty = errorType.addProperty({
        name: "body",
        type: getTextOfTsNode(referenceToErrorBodyType),
    });

    const networkErrorVisitableItem: visitorUtils.VisitableItem = {
        caseInSwitchStatement: ts.factory.createStringLiteral(
            file.externalDependencies.serviceUtils.NetworkError.ERROR_NAME
        ),
        keyInVisitor: "_network",
        visitorArgument: undefined,
    };

    const visitableItemsForServerErrors = constructVisitableItemsForServerErrors({
        endpoint,
        file,
    });

    const visitorInterface = endpointModule.addInterface(
        visitorUtils.generateVisitorInterface({
            items: {
                ...visitableItemsForServerErrors,
                items: [...visitableItemsForServerErrors.items, networkErrorVisitableItem],
            },
            name: `${errorType.getName()}Visitor`,
        })
    );

    const visitProperty = errorType.addProperty({
        name: "_visit",
        type: getTextOfTsNode(
            visitorUtils.generateVisitMethodType(
                ts.factory.createQualifiedName(referenceToEndpointModule, visitorInterface.getName())
            )
        ),
    });

    return {
        reference: ts.factory.createTypeReferenceNode(referenceToErrorType),
        referenceToBody: referenceToErrorBodyType,
        generateConstructServerErrorBody: () =>
            generateConstructServerErrorBody({
                file,
                errorBodyProperty,
                visitProperty,
                referenceToErrorBodyType,
                visitableItemsForServerErrors,
            }),
        generateConstructNetworkErrorBody: () =>
            generateConstructNetworkErrorBody({
                file,
                errorBodyProperty,
                visitProperty,
                networkErrorVisitableItem,
            }),
    };
}

function constructVisitableItemsForServerErrors({
    endpoint,
    file,
}: {
    endpoint: HttpEndpoint;
    file: File;
}): visitorUtils.VisitableItems {
    return {
        items: [
            ...endpoint.errors.map((error) => {
                const errorDeclaration = file.getErrorDeclaration(error.error);
                const referenceToErrorBodyType = file.getReferenceToError(error.error);
                return {
                    caseInSwitchStatement: ts.factory.createStringLiteral(errorDeclaration.discriminantValue.wireValue),
                    keyInVisitor: errorDeclaration.discriminantValue.camelCase,
                    visitorArgument: {
                        argument: ts.factory.createAsExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                                file.externalDependencies.serviceUtils.Fetcher.Response.BODY
                            ),
                            referenceToErrorBodyType
                        ),
                        type: referenceToErrorBodyType,
                    },
                };
            }),
        ],
        unknownArgument: {
            name: "details",
            type: file.externalDependencies.serviceUtils.ErrorDetails._getReferenceToType(),
            argument: ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createPropertyAssignment(
                        file.externalDependencies.serviceUtils.ErrorDetails.STATUS_CODE,
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                            file.externalDependencies.serviceUtils.Fetcher.ServerResponse.STATUS_CODE
                        )
                    ),
                ],
                false
            ),
        },
    };
}

function generateConstructNetworkErrorBody({
    file,
    errorBodyProperty,
    visitProperty,
    networkErrorVisitableItem,
}: {
    file: File;
    errorBodyProperty: PropertySignature;
    visitProperty: PropertySignature;
    networkErrorVisitableItem: visitorUtils.VisitableItem;
}) {
    return ts.factory.createObjectLiteralExpression(
        [
            ts.factory.createPropertyAssignment(
                errorBodyProperty.getName(),
                ts.factory.createObjectLiteralExpression([
                    ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier(file.fernConstants.errorDiscriminant),
                        ts.factory.createStringLiteral(file.externalDependencies.serviceUtils.NetworkError.ERROR_NAME)
                    ),
                ])
            ),
            ts.factory.createPropertyAssignment(
                visitProperty.getName(),
                ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier(visitorUtils.VISITOR_PARAMETER_NAME),
                            undefined,
                            undefined,
                            undefined
                        ),
                    ],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier(visitorUtils.VISITOR_PARAMETER_NAME),
                            networkErrorVisitableItem.keyInVisitor
                        ),
                        undefined,
                        []
                    )
                )
            ),
        ],
        true
    );
}

function generateConstructServerErrorBody({
    file,
    errorBodyProperty,
    visitProperty,
    referenceToErrorBodyType,
    visitableItemsForServerErrors,
}: {
    file: File;
    errorBodyProperty: PropertySignature;
    visitProperty: PropertySignature;
    referenceToErrorBodyType: ts.TypeNode;
    visitableItemsForServerErrors: visitorUtils.VisitableItems;
}) {
    return ts.factory.createObjectLiteralExpression(
        [
            ts.factory.createPropertyAssignment(
                errorBodyProperty.getName(),
                ts.factory.createAsExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier(ClientConstants.HttpService.Endpoint.Variables.RESPONSE),
                        file.externalDependencies.serviceUtils.Fetcher.Response.BODY
                    ),
                    referenceToErrorBodyType
                )
            ),
            ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(visitProperty.getName()),
                ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            visitorUtils.VISITOR_PARAMETER_NAME,
                            undefined,
                            undefined,
                            undefined
                        ),
                    ],
                    undefined,
                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.factory.createBlock(
                        [
                            visitorUtils.generateVisitSwitchStatement({
                                items: visitableItemsForServerErrors,
                                switchOn: ts.factory.createPropertyAccessChain(
                                    ts.factory.createAsExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(
                                                ClientConstants.HttpService.Endpoint.Variables.RESPONSE
                                            ),
                                            file.externalDependencies.serviceUtils.Fetcher.Response.BODY
                                        ),
                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
                                    ),
                                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                    file.fernConstants.errorDiscriminant
                                ),
                            }),
                        ],
                        true
                    )
                )
            ),
        ],
        true
    );
}
