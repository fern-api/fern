import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { DeclaredTypeName, QueryParameter, TypeReference } from "@fern-fern/ir-sdk/api";

import { RequestParameter } from "../../request-parameter/RequestParameter";

export declare namespace GeneratedQueryParams {
    export interface Init {
        requestParameter: RequestParameter | undefined;
    }
}

export class GeneratedQueryParams {
    private static QUERY_PARAMS_VARIABLE_NAME = "_queryParams";

    private requestParameter: RequestParameter | undefined;

    constructor({ requestParameter }: GeneratedQueryParams.Init) {
        this.requestParameter = requestParameter;
    }

    public getBuildStatements(context: SdkContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.requestParameter != null) {
            const queryParameters = this.requestParameter.getAllQueryParameters(context);
            if (queryParameters.length > 0) {
                statements.push(
                    ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList(
                            [
                                ts.factory.createVariableDeclaration(
                                    GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME,
                                    undefined,
                                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Record"), [
                                        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                        ts.factory.createUnionTypeNode([
                                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                            ts.factory.createArrayTypeNode(
                                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                                            ),
                                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword),
                                            ts.factory.createArrayTypeNode(
                                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword)
                                            )
                                        ])
                                    ]),
                                    ts.factory.createObjectLiteralExpression([], false)
                                )
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );
                for (const queryParameter of queryParameters) {
                    statements.push(
                        ...this.requestParameter.withQueryParameter(
                            queryParameter,
                            context,
                            (referenceToQueryParameter) => {
                                let assignmentExpression: ts.Expression;
                                const objectType = this.getObjectType(queryParameter.valueType, context);
                                if (objectType != null && context.includeSerdeLayer) {
                                    assignmentExpression = context.typeSchema
                                        .getSchemaOfNamedType(objectType, {
                                            isGeneratingSchema: false
                                        })
                                        .jsonOrThrow(referenceToQueryParameter, {
                                            allowUnrecognizedEnumValues: true,
                                            allowUnrecognizedUnionMembers: true,
                                            unrecognizedObjectKeys: "passthrough",
                                            skipValidation: false,
                                            breadcrumbsPrefix: [
                                                "request",
                                                context.retainOriginalCasing
                                                    ? queryParameter.name.name.originalName
                                                    : queryParameter.name.name.camelCase.unsafeName
                                            ],
                                            omitUndefined: context.omitUndefined
                                        });
                                } else if (objectType != null) {
                                    assignmentExpression = referenceToQueryParameter;
                                } else {
                                    assignmentExpression = context.type.stringify(
                                        referenceToQueryParameter,
                                        queryParameter.valueType,
                                        {
                                            includeNullCheckIfOptional: false
                                        }
                                    );
                                }
                                return [
                                    this.getQueryParameterAssignExpression({
                                        queryParameter,
                                        assignmentExpression
                                    })
                                ];
                            },
                            (referenceToQueryParameter) => {
                                let getAssignmentExpression: (itemReference: ts.Expression) => ts.Expression;
                                let isAssignmentExpressionAsync = false;
                                const objectType = this.getObjectType(
                                    queryParameter.valueType.type === "container" &&
                                        queryParameter.valueType.container.type === "list"
                                        ? queryParameter.valueType.container.list
                                        : queryParameter.valueType,
                                    context
                                );
                                if (objectType != null && context.includeSerdeLayer) {
                                    isAssignmentExpressionAsync = true;
                                    getAssignmentExpression = (itemReference) =>
                                        context.typeSchema
                                            .getSchemaOfNamedType(objectType, {
                                                isGeneratingSchema: false
                                            })
                                            .jsonOrThrow(itemReference, {
                                                allowUnrecognizedEnumValues: true,
                                                allowUnrecognizedUnionMembers: true,
                                                unrecognizedObjectKeys: "passthrough",
                                                skipValidation: false,
                                                breadcrumbsPrefix: [
                                                    "request",
                                                    context.retainOriginalCasing
                                                        ? queryParameter.name.name.originalName
                                                        : queryParameter.name.name.camelCase.unsafeName
                                                ],
                                                omitUndefined: context.omitUndefined
                                            });
                                } else if (objectType != null) {
                                    getAssignmentExpression = (itemReference) => itemReference;
                                } else {
                                    getAssignmentExpression = (itemReference) =>
                                        context.type.stringify(itemReference, queryParameter.valueType, {
                                            includeNullCheckIfOptional: false
                                        });
                                }
                                return [
                                    this.getQueryParameterArrayAssignExpression({
                                        queryParameter,
                                        referenceToQueryParameter,
                                        getAssignmentExpression,
                                        isAssignmentExpressionAsync
                                    })
                                ];
                            }
                        )
                    );
                }
            }
        }

        return statements;
    }

    public getReferenceTo(context: SdkContext): ts.Expression | undefined {
        if (this.requestParameter != null && this.requestParameter.getAllQueryParameters(context).length > 0) {
            return ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME);
        } else {
            return undefined;
        }
    }

    private getQueryParameterAssignExpression({
        queryParameter,
        assignmentExpression
    }: {
        queryParameter: QueryParameter;
        assignmentExpression: ts.Expression;
    }): ts.Statement {
        return ts.factory.createExpressionStatement(
            ts.factory.createBinaryExpression(
                ts.factory.createElementAccessExpression(
                    ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME),
                    ts.factory.createStringLiteral(queryParameter.name.wireValue)
                ),
                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                assignmentExpression
            )
        );
    }

    private getQueryParameterArrayAssignExpression({
        queryParameter,
        referenceToQueryParameter,
        getAssignmentExpression,
        isAssignmentExpressionAsync
    }: {
        queryParameter: QueryParameter;
        referenceToQueryParameter: ts.Expression;
        /* Pass in itemReference and get back the serialized query parameter */
        getAssignmentExpression: (itemReference: ts.Expression) => ts.Expression;
        isAssignmentExpressionAsync?: boolean;
    }): ts.Statement {
        const mapFunction = ts.factory.createArrowFunction(
            isAssignmentExpressionAsync ? [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    undefined,
                    ts.factory.createIdentifier("item"),
                    undefined,
                    undefined
                )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            getAssignmentExpression(ts.factory.createIdentifier("item"))
        );
        let mapExpression: ts.Expression = ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(referenceToQueryParameter, ts.factory.createIdentifier("map")),
            undefined,
            [mapFunction]
        );
        if (isAssignmentExpressionAsync) {
            mapExpression = ts.factory.createAwaitExpression(
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("Promise"),
                        ts.factory.createIdentifier("all")
                    ),
                    undefined,
                    [mapExpression]
                )
            );
        }

        return ts.factory.createExpressionStatement(
            ts.factory.createBinaryExpression(
                ts.factory.createElementAccessExpression(
                    ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME),
                    ts.factory.createStringLiteral(queryParameter.name.wireValue)
                ),
                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                mapExpression
            )
        );
    }

    private getObjectType(typeReference: TypeReference, context: SdkContext): DeclaredTypeName | undefined {
        switch (typeReference.type) {
            case "named":
                {
                    const typeDeclaration = context.type.getTypeDeclaration(typeReference);
                    switch (typeDeclaration.shape.type) {
                        case "object":
                            return typeReference;
                        case "alias": {
                            return this.getObjectType(typeDeclaration.shape.aliasOf, context);
                        }
                    }
                }
                break;
            case "container": {
                switch (typeReference.container.type) {
                    case "optional":
                        return this.getObjectType(typeReference.container.optional, context);
                }
            }
        }
        return undefined;
    }
}
