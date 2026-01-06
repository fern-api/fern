import { FernIr } from "@fern-fern/ir-sdk";
import { DeclaredTypeName, QueryParameter, TypeReference } from "@fern-fern/ir-sdk/api";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import {
    REQUEST_OPTIONS_ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME,
    REQUEST_OPTIONS_PARAMETER_NAME
} from "./requestOptionsParameter";

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

        if (this.queryParameters == null) {
            return statements;
        }
        if (this.queryParameters.length === 0) {
            return statements;
        }
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
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            ]),
                            ts.factory.createObjectLiteralExpression([], false)
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        );
        for (const queryParameter of this.queryParameters) {
            const listItemType =
                queryParameter.valueType.type === "container" && queryParameter.valueType.container.type === "list"
                    ? queryParameter.valueType.container.list
                    : queryParameter.valueType;
            const scalarNeedsTransform = this.scalarValueNeedsTransform(queryParameter.valueType, context);
            const itemNeedsTransform = this.listItemNeedsTransform(listItemType, context);
            const needsArrayCheck = scalarNeedsTransform || itemNeedsTransform;

            statements.push(
                ...this.withQueryParameter({
                    queryParameter,
                    referenceToQueryParameterProperty: this.referenceToQueryParameterProperty(
                        queryParameter.name.wireValue,
                        context
                    ),
                    needsArrayCheck,
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
                                const serializerCall = context.typeSchema
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
                                // Wrap in null check if the query parameter type is optional
                                if (this.isOptional(queryParameter.valueType)) {
                                    assignmentExpression = ts.factory.createConditionalExpression(
                                        ts.factory.createBinaryExpression(
                                            referenceToQueryParameter,
                                            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                                            ts.factory.createNull()
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                                        serializerCall,
                                        ts.factory.createToken(ts.SyntaxKind.ColonToken),
                                        referenceToQueryParameter
                                    );
                                } else {
                                    assignmentExpression = serializerCall;
                                }
                            } else {
                                assignmentExpression = referenceToQueryParameter;
                            }
                        }
                        // if it's a primitive type, use the original valueType to stringify
                        // nullSafeCall in the converter handles optional chaining for optional/nullable types
                        else if (primitiveType != null) {
                            if (primitiveTypeNeedsStringify(primitiveType.primitive)) {
                                assignmentExpression = context.type.stringify(
                                    referenceToQueryParameter,
                                    queryParameter.valueType,
                                    {
                                        includeNullCheckIfOptional: false
                                    }
                                );
                            } else {
                                assignmentExpression = referenceToQueryParameter;
                            }
                        } else {
                            assignmentExpression = context.type.stringify(
                                referenceToQueryParameter,
                                queryParameter.valueType,
                                {
                                    includeNullCheckIfOptional: true
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
                        const listItemType =
                            queryParameter.valueType.type === "container" &&
                            queryParameter.valueType.container.type === "list"
                                ? queryParameter.valueType.container.list
                                : queryParameter.valueType;
                        const objectType = this.getObjectType(listItemType, context);
                        const needsItemTransform = this.listItemNeedsTransform(listItemType, context);
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
                                context.type.stringify(itemReference, listItemType, {
                                    includeNullCheckIfOptional: false
                                });
                        }
                        return [
                            this.getQueryParameterArrayAssignExpression({
                                queryParameter,
                                referenceToQueryParameter,
                                getAssignmentExpression,
                                isAssignmentExpressionAsync,
                                needsItemTransform
                            })
                        ];
                    }
                })
            );
        }

        return statements;
    }

    public getReferenceTo(): ts.Expression | undefined {
        const getRequestOptionsAdditionalQueryParameters = ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(REQUEST_OPTIONS_ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME)
        );
        if (this.queryParameters != null && this.queryParameters.length > 0) {
            return ts.factory.createObjectLiteralExpression(
                [
                    ts.factory.createSpreadAssignment(
                        ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME)
                    ),
                    ts.factory.createSpreadAssignment(getRequestOptionsAdditionalQueryParameters)
                ],
                false
            );
        } else {
            return getRequestOptionsAdditionalQueryParameters;
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
        isAssignmentExpressionAsync,
        needsItemTransform
    }: {
        queryParameter: QueryParameter;
        referenceToQueryParameter: ts.Expression;
        getAssignmentExpression: (itemReference: ts.Expression) => ts.Expression;
        isAssignmentExpressionAsync?: boolean;
        needsItemTransform: boolean;
    }): ts.Statement {
        let assignmentExpression: ts.Expression;

        if (needsItemTransform) {
            const mapFunction = ts.factory.createArrowFunction(
                isAssignmentExpressionAsync ? [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
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
                ts.factory.createPropertyAccessExpression(
                    referenceToQueryParameter,
                    ts.factory.createIdentifier("map")
                ),
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
            assignmentExpression = mapExpression;
        } else {
            assignmentExpression = referenceToQueryParameter;
        }

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
                    case "nullable":
                        return this.getPrimitiveType(typeReference.container.nullable, context);
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
                    case "nullable":
                        return this.getObjectType(typeReference.container.nullable, context);
                }
            }
        }
        return undefined;
    }

    private isOptional(typeReference: TypeReference): boolean {
        if (typeReference.type === "container" && typeReference.container.type === "optional") {
            return true;
        }
        return false;
    }

    private listItemNeedsTransform(listItemType: TypeReference, context: SdkContext): boolean {
        const objectType = this.getObjectType(listItemType, context);
        if (objectType != null) {
            return context.includeSerdeLayer;
        }
        const primitiveType = this.getPrimitiveType(listItemType, context);
        if (primitiveType != null) {
            return primitiveTypeNeedsStringify(primitiveType.primitive);
        }
        return true;
    }

    private scalarValueNeedsTransform(typeReference: TypeReference, context: SdkContext): boolean {
        const objectType = this.getObjectType(typeReference, context);
        if (objectType != null) {
            return context.includeSerdeLayer;
        }
        const primitiveType = this.getPrimitiveType(typeReference, context);
        if (primitiveType != null) {
            return primitiveTypeNeedsStringify(primitiveType.primitive);
        }
        return true;
    }

    private withQueryParameter({
        queryParameter,
        referenceToQueryParameterProperty,
        queryParamSetter,
        queryParamItemSetter,
        needsArrayCheck
    }: {
        queryParameter: QueryParameter;
        referenceToQueryParameterProperty: ts.Expression;
        queryParamSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
        queryParamItemSetter: (referenceToQueryParameter: ts.Expression) => ts.Statement[];
        needsArrayCheck: boolean;
    }): ts.Statement[] {
        if (queryParameter.allowMultiple && needsArrayCheck) {
            return [
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
        }
        return queryParamSetter(referenceToQueryParameterProperty);
    }
}

function primitiveTypeNeedsStringify(primitiveType: FernIr.PrimitiveType): boolean {
    switch (primitiveType.v1) {
        case "INTEGER":
        case "LONG":
        case "UINT":
        case "UINT_64":
        case "FLOAT":
        case "DOUBLE":
        case "BOOLEAN":
        case "STRING":
        case "UUID":
        case "BASE_64":
        case "BIG_INTEGER":
            return false;
        case "DATE":
        case "DATE_TIME":
            return true;
    }
}
