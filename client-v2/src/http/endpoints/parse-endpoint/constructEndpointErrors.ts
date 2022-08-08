import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { getTextOfTsNode, getWriterForMultiLineUnionType, visitorUtils } from "@fern-typescript/commons";
import { VisitableItem } from "@fern-typescript/commons/src/utils/visitorUtils";
import { File } from "@fern-typescript/declaration-handler";
import { InterfaceDeclaration, ModuleDeclaration, PropertySignature, ts } from "ts-morph";
import { ClientEndpointError } from "./ParsedClientEndpoint";

const PARSE_PROPERTY_NAME = "_parse";

export function constructEndpointErrors({
    service,
    endpoint,
    file,
    endpointModule,
    addEndpointUtil,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    file: File;
    endpointModule: ModuleDeclaration;
    addEndpointUtil: (util: ts.ObjectLiteralElementLike) => void;
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

    const errorBodyProperty = errorType.addProperty({
        name: "body",
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

    const referenceToErrorBodyType = ts.factory.createIndexedAccessTypeNode(
        ts.factory.createTypeReferenceNode(referenceToErrorType),
        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(errorBodyProperty.getName()))
    );

    const errorUtils: ts.ObjectLiteralElementLike[] = [];

    addParse({
        errorBodyProperty,
        errorType,
        referenceToErrorType,
        referenceToErrorBodyType,
        addErrorUtil: (util) => {
            errorUtils.push(util);
        },
        file,
        endpoint,
        endpointModule,
        referenceToEndpointModule,
    });

    addEndpointUtil(
        ts.factory.createPropertyAssignment(
            errorType.getName(),
            ts.factory.createObjectLiteralExpression(errorUtils, true)
        )
    );

    return {
        reference: ts.factory.createTypeReferenceNode(referenceToErrorType),
        referenceToBody: referenceToErrorBodyType,
        generateParse: (body) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                            referenceToService.expression,
                            ts.factory.createIdentifier(endpointModule.getName())
                        ),
                        errorType.getName()
                    ),
                    PARSE_PROPERTY_NAME
                ),
                undefined,
                [body]
            ),
    };
}

function addParse({
    endpointModule,
    referenceToEndpointModule,
    errorBodyProperty,
    errorType,
    referenceToErrorType,
    referenceToErrorBodyType,
    addErrorUtil,
    endpoint,
    file,
}: {
    endpointModule: ModuleDeclaration;
    referenceToEndpointModule: ts.EntityName;
    errorBodyProperty: PropertySignature;
    errorType: InterfaceDeclaration;
    referenceToErrorType: ts.EntityName;
    referenceToErrorBodyType: ts.TypeNode;
    addErrorUtil: (util: ts.ObjectLiteralElementLike) => void;
    endpoint: HttpEndpoint;
    file: File;
}) {
    const visitableItems: VisitableItem[] = [
        ...endpoint.errors.map((error) => ({
            caseInSwitchStatement: ts.factory.createStringLiteral(error.discriminantValue),
            keyInVisitor: file.getErrorDeclaration(error.error).discriminantValue,
            visitorArgument: {
                argument: ts.factory.createIdentifier(visitorUtils.VALUE_PARAMETER_NAME),
                type: file.getReferenceToError(error.error),
            },
        })),
        {
            caseInSwitchStatement: ts.factory.createStringLiteral(
                file.externalDependencies.serviceUtils.NetworkError.ERROR_NAME
            ),
            keyInVisitor: file.externalDependencies.serviceUtils.NetworkError.ERROR_NAME,
            visitorArgument: undefined,
        },
    ];

    const visitorInterface = endpointModule.addInterface(
        visitorUtils.generateVisitorInterface({
            items: visitableItems,
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

    addErrorUtil(
        ts.factory.createPropertyAssignment(
            PARSE_PROPERTY_NAME,
            constructParseImplementation({
                errorBodyProperty,
                referenceToErrorBodyType,
                referenceToErrorType,
                visitProperty,
                visitableItems,
                file,
            })
        )
    );
}
function constructParseImplementation({
    errorBodyProperty,
    referenceToErrorType,
    referenceToErrorBodyType,
    visitProperty,
    visitableItems,
    file,
}: {
    errorBodyProperty: PropertySignature;
    referenceToErrorType: ts.EntityName;
    referenceToErrorBodyType: ts.TypeNode;
    visitProperty: PropertySignature;
    visitableItems: visitorUtils.VisitableItem[];
    file: File;
}): ts.Expression {
    return ts.factory.createArrowFunction(
        undefined,
        undefined,
        [
            ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier(errorBodyProperty.getName()),
                undefined,
                referenceToErrorBodyType
            ),
        ],
        ts.factory.createTypeReferenceNode(referenceToErrorType),
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createBlock(
            [
                ts.factory.createReturnStatement(
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createShorthandPropertyAssignment(
                                ts.factory.createIdentifier(errorBodyProperty.getName()),
                                undefined
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
                                            ts.factory.createIdentifier(visitorUtils.VISITOR_PARAMETER_NAME)
                                        ),
                                    ],
                                    undefined,
                                    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                    visitorUtils.generateVisitSwitchStatement({
                                        items: visitableItems,
                                        switchOn: ts.factory.createPropertyAccessExpression(
                                            ts.factory.createIdentifier(errorBodyProperty.getName()),
                                            file.fernConstants.errorDiscriminant
                                        ),
                                    })
                                )
                            ),
                        ],
                        true
                    )
                ),
            ],
            true
        )
    );
}
