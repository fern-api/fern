import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { getClientDefaultValue } from "./isLiteralHeader.js";
import {
    REQUEST_OPTIONS_ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME,
    REQUEST_OPTIONS_PARAMETER_NAME
} from "./requestOptionsParameter.js";

export declare namespace GeneratedQueryParams {
    export interface Init {
        queryParameters: FernIr.QueryParameter[] | undefined;
        referenceToQueryParameterProperty: (queryParameterKey: string, context: FileContext) => ts.Expression;
    }
}

export class GeneratedQueryParams {
    public static readonly QUERY_PARAMS_VARIABLE_NAME = "_queryParams" as const;

    private queryParameters: FernIr.QueryParameter[] | undefined;
    private referenceToQueryParameterProperty: (queryParameterKey: string, context: FileContext) => ts.Expression;

    constructor({ queryParameters, referenceToQueryParameterProperty }: GeneratedQueryParams.Init) {
        this.queryParameters = queryParameters;
        this.referenceToQueryParameterProperty = referenceToQueryParameterProperty;
    }

    public getBuildStatements(context: FileContext): ts.Statement[] {
        if (this.queryParameters == null || this.queryParameters.length === 0) {
            return [];
        }

        const properties: ts.ObjectLiteralElementLike[] = [];

        for (const queryParameter of this.queryParameters) {
            const wireValue = getWireValue(queryParameter.name);
            const referenceToQueryParameter = this.referenceToQueryParameterProperty(wireValue, context);
            const valueExpression = this.getQueryParameterValueExpression({
                queryParameter,
                referenceToQueryParameter,
                context
            });

            const isValidIdentifier = isValidJsIdentifier(wireValue);
            const canUseShorthand =
                isValidIdentifier && ts.isIdentifier(valueExpression) && valueExpression.text === wireValue;

            if (canUseShorthand) {
                properties.push(ts.factory.createShorthandPropertyAssignment(ts.factory.createIdentifier(wireValue)));
            } else if (isValidIdentifier) {
                properties.push(
                    ts.factory.createPropertyAssignment(ts.factory.createIdentifier(wireValue), valueExpression)
                );
            } else {
                properties.push(
                    ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(wireValue), valueExpression)
                );
            }
        }

        return [
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
                            ts.factory.createObjectLiteralExpression(properties, true)
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        ];
    }

    private getQueryParameterValueExpression({
        queryParameter,
        referenceToQueryParameter,
        context
    }: {
        queryParameter: FernIr.QueryParameter;
        referenceToQueryParameter: ts.Expression;
        context: FileContext;
    }): ts.Expression {
        const listItemType =
            queryParameter.valueType.type === "container" && queryParameter.valueType.container.type === "list"
                ? queryParameter.valueType.container.list
                : queryParameter.valueType;
        const scalarNeedsTransform = this.scalarValueNeedsTransform(queryParameter.valueType, context);
        const itemNeedsTransform = this.listItemNeedsTransform(listItemType, context);
        const needsArrayCheck = scalarNeedsTransform || itemNeedsTransform;

        const scalarExpression = this.getScalarValueExpression({
            queryParameter,
            referenceToQueryParameter,
            context
        });

        // If clientDefault is set, add a fallback: value ?? "clientDefault"
        // Skip when the type is nullable — explicit null means "don't send the parameter",
        // and ?? would replace null with the clientDefault, preventing intentional omission.
        const clientDefaultVal = getClientDefaultValue(queryParameter.clientDefault);

        if (!queryParameter.allowMultiple) {
            if (clientDefaultVal != null && !typeContainsNullable(queryParameter.valueType, context)) {
                return ts.factory.createBinaryExpression(
                    scalarExpression,
                    ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                    ts.factory.createStringLiteral(clientDefaultVal.toString())
                );
            }
            return scalarExpression;
        }

        const arrayExpression = this.getArrayValueExpression({
            queryParameter,
            referenceToQueryParameter,
            listItemType,
            context
        });

        // For allowMultiple params, apply clientDefault fallback to the scalar branch
        const scalarWithDefault =
            clientDefaultVal != null && !typeContainsNullable(queryParameter.valueType, context)
                ? ts.factory.createBinaryExpression(
                      scalarExpression,
                      ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                      ts.factory.createStringLiteral(clientDefaultVal.toString())
                  )
                : scalarExpression;

        if (!needsArrayCheck) {
            return scalarWithDefault;
        }

        return ts.factory.createConditionalExpression(
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("Array"),
                    ts.factory.createIdentifier("isArray")
                ),
                undefined,
                [referenceToQueryParameter]
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            arrayExpression,
            ts.factory.createToken(ts.SyntaxKind.ColonToken),
            scalarWithDefault
        );
    }

    private getScalarValueExpression({
        queryParameter,
        referenceToQueryParameter,
        context
    }: {
        queryParameter: FernIr.QueryParameter;
        referenceToQueryParameter: ts.Expression;
        context: FileContext;
    }): ts.Expression {
        const objectType = this.getObjectType(queryParameter.valueType, context);
        const primitiveType = objectType ? undefined : this.getPrimitiveType(queryParameter.valueType, context);
        const paramName = context.retainOriginalCasing
            ? getOriginalName(queryParameter.name)
            : context.case.camelUnsafe(queryParameter.name);

        if (objectType != null) {
            if (context.includeSerdeLayer) {
                const serializerCall = context.typeSchema
                    .getSchemaOfNamedType(objectType, { isGeneratingSchema: false })
                    .jsonOrThrow(referenceToQueryParameter, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: false,
                        breadcrumbsPrefix: ["request", paramName],
                        omitUndefined: context.omitUndefined
                    });
                if (this.isOptional(queryParameter.valueType) || queryParameter.clientDefault != null) {
                    return ts.factory.createConditionalExpression(
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
                }
                return serializerCall;
            }
            return referenceToQueryParameter;
        }

        if (primitiveType != null) {
            if (primitiveTypeNeedsStringify(primitiveType.primitive)) {
                return context.type.stringify(referenceToQueryParameter, queryParameter.valueType, {
                    includeNullCheckIfOptional: true
                });
            }
            return referenceToQueryParameter;
        }

        return context.type.stringify(referenceToQueryParameter, queryParameter.valueType, {
            includeNullCheckIfOptional: true
        });
    }

    private getArrayValueExpression({
        queryParameter,
        referenceToQueryParameter,
        listItemType,
        context
    }: {
        queryParameter: FernIr.QueryParameter;
        referenceToQueryParameter: ts.Expression;
        listItemType: FernIr.TypeReference;
        context: FileContext;
    }): ts.Expression {
        const objectType = this.getObjectType(listItemType, context);
        const needsItemTransform = this.listItemNeedsTransform(listItemType, context);

        if (!needsItemTransform) {
            return referenceToQueryParameter;
        }

        let getItemExpression: (itemReference: ts.Expression) => ts.Expression;
        let isAsync = false;

        if (objectType != null && context.includeSerdeLayer) {
            isAsync = true;
            getItemExpression = (itemReference) =>
                context.typeSchema
                    .getSchemaOfNamedType(objectType, { isGeneratingSchema: false })
                    .jsonOrThrow(itemReference, {
                        allowUnrecognizedEnumValues: true,
                        allowUnrecognizedUnionMembers: true,
                        unrecognizedObjectKeys: "passthrough",
                        skipValidation: false,
                        breadcrumbsPrefix: [
                            "request",
                            context.retainOriginalCasing
                                ? getOriginalName(queryParameter.name)
                                : context.case.camelUnsafe(queryParameter.name)
                        ],
                        omitUndefined: context.omitUndefined
                    });
        } else if (objectType != null) {
            getItemExpression = (itemReference) => itemReference;
        } else {
            getItemExpression = (itemReference) =>
                context.type.stringify(itemReference, listItemType, { includeNullCheckIfOptional: false });
        }

        const mapFunction = ts.factory.createArrowFunction(
            isAsync ? [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)] : undefined,
            undefined,
            [ts.factory.createParameterDeclaration(undefined, undefined, ts.factory.createIdentifier("item"))],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            getItemExpression(ts.factory.createIdentifier("item"))
        );

        let mapExpression: ts.Expression = ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(referenceToQueryParameter, ts.factory.createIdentifier("map")),
            undefined,
            [mapFunction]
        );

        if (isAsync) {
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

        return mapExpression;
    }

    /**
     * Returns a ts.Expression that produces the final query string via the builder pattern.
     *
     * Emits:
     *     core.url.queryBuilder()
     *         .addMany(_queryParams)
     *         .add("tags", _queryParams["tags"], { style: "comma" })
     *         .mergeAdditional(requestOptions?.queryParams)
     *         .build()
     *
     * Non-comma params are added in bulk via `.addMany()`, then comma-style params
     * override their keys individually via `.add(..., { style: "comma" })`.
     */
    public getQueryStringExpression(context: FileContext): ts.Expression | undefined {
        if (this.queryParameters == null || this.queryParameters.length === 0) {
            return undefined;
        }

        const additionalQueryParams = ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(REQUEST_OPTIONS_ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME)
        );

        const commaParams = this.queryParameters.filter((qp) => qp.explode === false);

        // core.url.queryBuilder()
        let chain: ts.Expression = context.coreUtilities.urlUtils.queryBuilder._invoke();

        // .addMany(_queryParams) — adds all params with default "repeat" format
        chain = ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(chain, ts.factory.createIdentifier("addMany")),
            undefined,
            [ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME)]
        );

        // Override comma-style params individually
        for (const queryParameter of commaParams) {
            const wireValue = getWireValue(queryParameter.name);

            const valueRef = ts.factory.createElementAccessExpression(
                ts.factory.createIdentifier(GeneratedQueryParams.QUERY_PARAMS_VARIABLE_NAME),
                ts.factory.createStringLiteral(wireValue)
            );

            chain = ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(chain, ts.factory.createIdentifier("add")),
                undefined,
                [
                    ts.factory.createStringLiteral(wireValue),
                    valueRef,
                    ts.factory.createObjectLiteralExpression([
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("style"),
                            ts.factory.createStringLiteral("comma")
                        )
                    ])
                ]
            );
        }

        // .mergeAdditional(requestOptions?.queryParams)
        chain = ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(chain, ts.factory.createIdentifier("mergeAdditional")),
            undefined,
            [additionalQueryParams]
        );

        // .build()
        chain = ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(chain, ts.factory.createIdentifier("build")),
            undefined,
            []
        );

        return chain;
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

    private getPrimitiveType(
        typeReference: FernIr.TypeReference,
        context: FileContext
    ): FernIr.TypeReference.Primitive | undefined {
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

    private getObjectType(
        typeReference: FernIr.TypeReference,
        context: FileContext
    ): FernIr.DeclaredTypeName | undefined {
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

    private isOptional(typeReference: FernIr.TypeReference): boolean {
        if (typeReference.type === "container" && typeReference.container.type === "optional") {
            return true;
        }
        return false;
    }

    private listItemNeedsTransform(listItemType: FernIr.TypeReference, context: FileContext): boolean {
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

    private scalarValueNeedsTransform(typeReference: FernIr.TypeReference, context: FileContext): boolean {
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
        case "DATE_TIME_RFC_2822":
            return true;
        default:
            return false;
    }
}

function typeContainsNullable(type: FernIr.TypeReference, context: FileContext): boolean {
    switch (type.type) {
        case "container":
            switch (type.container.type) {
                case "nullable":
                    return true;
                case "optional":
                    return typeContainsNullable(type.container.optional, context);
                default:
                    return false;
            }
        case "named": {
            const declaration = context.type.getTypeDeclaration(type);
            if (declaration.shape.type === "alias") {
                return typeContainsNullable(declaration.shape.aliasOf, context);
            }
            return false;
        }
        default:
            return false;
    }
}

function isValidJsIdentifier(name: string): boolean {
    if (name.length === 0) {
        return false;
    }
    const firstChar = name.charCodeAt(0);
    if (
        !(
            (firstChar >= 65 && firstChar <= 90) ||
            (firstChar >= 97 && firstChar <= 122) ||
            firstChar === 95 ||
            firstChar === 36
        )
    ) {
        return false;
    }
    for (let i = 1; i < name.length; i++) {
        const char = name.charCodeAt(i);
        if (
            !(
                (char >= 65 && char <= 90) ||
                (char >= 97 && char <= 122) ||
                (char >= 48 && char <= 57) ||
                char === 95 ||
                char === 36
            )
        ) {
            return false;
        }
    }
    return true;
}
