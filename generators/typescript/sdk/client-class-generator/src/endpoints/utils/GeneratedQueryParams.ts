import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { DeclaredTypeName, QueryParameter, TypeReference } from "@fern-fern/ir-sdk";

export declare namespace GeneratedQueryParams {
    export interface Init {
        queryParameters: QueryParameter[] | undefined;
        referenceToQueryParameterProperty: (queryParameterKey: string, context: SdkContext) => ts.Expression;
    }
}

export class GeneratedQueryParams {
    public static readonly QUERY_PARAMS_VARIABLE_NAME = "_queryParams" as const;

    private queryParameters: QueryParameter[] | undefined;
    private referenceToQueryParameterProperty: (queryParameterKey: string, context: SdkContext) => ts.Expression;

    constructor({ queryParameters, referenceToQueryParameterProperty }: GeneratedQueryParams.Init) {
        this.queryParameters = queryParameters;
        this.referenceToQueryParameterProperty = referenceToQueryParameterProperty;
    }

    public getBuildStatements(context: SdkContext): ts.Statement[] {
        const statements: ts.Statement[] = [];

        if (this.queryParameters != null) {
            if (this.queryParameters.length > 0) {
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
                                            ),
                                            ts.factory.createLiteralTypeNode(ts.factory.createNull())
                                        ])
                                    ]),
                                    ts.factory.createObjectLiteralExpression([], false)
                                )
                            ],
                            ts.NodeFlags.Const
                        )
                    )
                );
                for (const queryParameter of this.queryParameters) {
                    statements.push(
                        ...this.withQueryParameter({
                            queryParameter,
                            referenceToQueryParameterProperty: this.referenceToQueryParameterProperty(
                                queryParameter.name.wireValue,
                                context
                            ),
                            context,
                            queryParamSetter: (referenceToQueryParameter) => {
                                let assignmentExpression: ts.Expression;
                                const objectType = this.getObjectType(queryParameter.valueType, context);
                                const primitiveType = objectType
                                    ? undefined
                                    : this.getPrimitiveType(queryParameter.valueType, context);
                                const paramName = context.retainOriginalCasing
                                    ? queryParameter.name.name.originalName
                                    : queryParameter.name.name.camelCase.unsafeName;
                                if (objectType != null) {
                                    if (context.includeSerdeLayer) {
                                        assignmentExpression = context.typeSchema
                                            .getSchemaOfNamedType(objectType, {
                                                isGeneratingSchema: false
                                            })
                                            .jsonOrThrow(referenceToQueryParameter, {
                                                allowUnrecognizedEnumValues: true,
                                                allowUnrecognizedUnionMembers: true,
                                                unrecognizedObjectKeys: "passthrough",
                                                skipValidation: false,
                                                breadcrumbsPrefix: ["request", paramName],
                                                omitUndefined: context.omitUndefined
                                            });
                                    } else {
                                        assignmentExpression = referenceToQueryParameter;
                                    }
                                }
                                // if it's a primitive type, the previous null check already unwrapped the null or undefined
                                // use the primitive type directly to stringify
                                else if (primitiveType != null) {
                                    assignmentExpression = context.type.stringify(
                                        referenceToQueryParameter,
                                        primitiveType,
                                        {
                                            includeNullCheckIfOptional: false
                                        }
                                    );
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
                            queryParamItemSetter: (referenceToQueryParameter) => {
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
                        })
                    );
                }
            }
        }

        return statements;
    }

    public getReferenceTo(): ts.Expression | undefined {
        if (this.queryParameters != null && this.queryParameters.length > 0) {
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

    /**
     * Get primitive type from type reference, whether it's nested in optional or alias.
     */
    private getPrimitiveType(typeReference: TypeReference, context: SdkContext): TypeReference.Primitive | undefined {
        switch (typeReference.type) {
            case "primitive":
                return typeReference;
            case "named":
                {
                    const typeDeclaration = context.type.getTypeDeclaration(typeReference);
                    switch (typeDeclaration.shape.type) {
                        case "alias": {
                            return this.getPrimitiveType(typeDeclaration.shape.aliasOf, context);
                        }
                    }
                }
                break;
            case "container": {
                switch (typeReference.container.type) {
                    case "optional":
                        return this.getPrimitiveType(typeReference.container.optional, context);
                }
            }
        }
        return undefined;
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

    private withQueryParameter({
        queryParameter,
        referenceToQueryParameterProperty,
        context,
        queryParamSetter,
        queryParamItemSetter
    }: {
        queryParameter: QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        context: SdkContext;
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
    }): ts.Statement[] {
        let statements: ts.Statement[];

        if (queryParameter.allowMultiple) {
            statements = [
                ts.factory.createIfStatement(
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("Array"),
                            ts.factory.createIdentifier("isArray")
                        ),
                        undefined,
                        [referenceToQueryParameterProperty]
                    ),
                    ts.factory.createBlock(queryParamItemSetter(referenceToQueryParameterProperty), true),
                    ts.factory.createBlock(queryParamSetter(referenceToQueryParameterProperty), true)
                )
            ];
        } else {
            statements = queryParamSetter(referenceToQueryParameterProperty);
        }

        const isQueryParamOptional = context.type.isOptional(queryParameter.valueType);
        const isQueryParamNullable = context.type.isNullable(queryParameter.valueType);
        if (!isQueryParamNullable && !isQueryParamOptional) {
            return statements;
        }
        if (isQueryParamNullable) {
            return [
                ts.factory.createIfStatement(
                    ts.factory.createBinaryExpression(
                        referenceToQueryParameterProperty,
                        ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
                        ts.factory.createIdentifier("undefined")
                    ),
                    ts.factory.createBlock(statements)
                )
            ];
        }
        return [
            ts.factory.createIfStatement(
                ts.factory.createBinaryExpression(
                    referenceToQueryParameterProperty,
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                    ts.factory.createNull()
                ),
                ts.factory.createBlock(statements)
            )
        ];
    }
}
