import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { GeneratedHeader } from "../../GeneratedHeader.js";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl.js";
import { RequestParameter } from "../../request-parameter/RequestParameter.js";
import { getClientDefaultValue, getLiteralValueForHeader } from "./isLiteralHeader.js";
import { REQUEST_OPTIONS_PARAMETER_NAME } from "./requestOptionsParameter.js";

export const HEADERS_VAR_NAME = "_headers";
export function generateHeaders({
    context,
    intermediateRepresentation,
    generatedSdkClientClass,
    requestParameter,
    service,
    endpoint,
    idempotencyHeaders,
    additionalHeaders = [],
    additionalSpreadHeaders = [],
    headersToMergeAfterClientOptionsHeaders = []
}: {
    context: FileContext;
    intermediateRepresentation: FernIr.IntermediateRepresentation;
    generatedSdkClientClass: GeneratedSdkClientClassImpl;
    requestParameter: RequestParameter | undefined;
    service: FernIr.HttpService;
    endpoint: FernIr.HttpEndpoint;
    idempotencyHeaders: FernIr.HttpHeader[];
    additionalHeaders?: GeneratedHeader[];
    additionalSpreadHeaders?: ts.Expression[];
    headersToMergeAfterClientOptionsHeaders?: ts.Expression[];
}): ts.Statement[] {
    const statements: ts.Statement[] = [];

    let authProviderHeaders: ts.Expression | undefined;
    if (
        generatedSdkClientClass.hasAuthProvider() &&
        endpoint.auth &&
        context.authProvider.isAuthEndpoint(endpoint) === false
    ) {
        const metadataArg = generatedSdkClientClass.getGenerateEndpointMetadata()
            ? ts.factory.createObjectLiteralExpression([
                  ts.factory.createPropertyAssignment(
                      "endpointMetadata",
                      generatedSdkClientClass.getReferenceToMetadataForEndpointSupplier()
                  )
              ])
            : undefined;

        statements.push(
            ts.factory.createVariableStatement(
                undefined,
                ts.factory.createVariableDeclarationList(
                    [
                        ts.factory.createVariableDeclaration(
                            "_authRequest",
                            undefined,
                            context.coreUtilities.auth.AuthRequest._getReferenceToType(),
                            context.coreUtilities.auth.AuthProvider.getAuthRequest.invoke(
                                generatedSdkClientClass.getReferenceToAuthProviderOrThrow(),
                                metadataArg
                            )
                        )
                    ],
                    ts.NodeFlags.Const
                )
            )
        );
        authProviderHeaders = ts.factory.createIdentifier("_authRequest.headers");
    }

    const elements: GeneratedHeader[] = [];

    for (const header of [...service.headers, ...endpoint.headers]) {
        elements.push({
            header: getWireValue(header.name),
            value: getValueExpressionForHeader({ header, context, requestParameter })
        });
    }

    if (endpoint.idempotent) {
        for (const header of idempotencyHeaders) {
            elements.push({
                header: getWireValue(header.name),
                value: getValueExpressionForIdempotencyHeader({ header, context })
            });
        }
    }

    elements.push(...getOverridableRootHeaders({ context, intermediateRepresentation }));

    elements.push(...additionalHeaders);

    const onlyDefinedHeaders: ts.ObjectLiteralElementLike[] = [];

    onlyDefinedHeaders.push(
        ...elements.map(({ header, value }) =>
            ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(header), value)
        )
    );

    for (const additionalSpreadHeader of additionalSpreadHeaders) {
        onlyDefinedHeaders.push(
            ts.factory.createSpreadAssignment(ts.factory.createParenthesizedExpression(additionalSpreadHeader))
        );
    }

    context.importsManager.addImportFromRoot("core/headers", {
        namedImports: ["mergeHeaders"]
    });

    const mergeHeadersArgs = [];

    if (authProviderHeaders) {
        mergeHeadersArgs.push(authProviderHeaders);
    }

    mergeHeadersArgs.push(
        ts.factory.createPropertyAccessChain(
            ts.factory.createPropertyAccessChain(
                ts.factory.createThis(),
                undefined,
                GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            "headers"
        )
    );
    if (onlyDefinedHeaders.length > 0) {
        context.importsManager.addImportFromRoot("core/headers", {
            namedImports: ["mergeOnlyDefinedHeaders"]
        });
        mergeHeadersArgs.push(
            ts.factory.createCallExpression(ts.factory.createIdentifier("mergeOnlyDefinedHeaders"), undefined, [
                ts.factory.createObjectLiteralExpression(onlyDefinedHeaders)
            ])
        );
    }

    mergeHeadersArgs.push(...headersToMergeAfterClientOptionsHeaders);

    mergeHeadersArgs.push(
        ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier("headers")
        )
    );

    statements.push(
        ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        HEADERS_VAR_NAME,
                        undefined,
                        ts.factory.createIndexedAccessTypeNode(
                            context.coreUtilities.fetcher.Fetcher.Args._getReferenceToType(),
                            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral("headers"))
                        ),
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("mergeHeaders"),
                            undefined,
                            mergeHeadersArgs
                        )
                    )
                ],
                ts.NodeFlags.Let
            )
        )
    );
    return statements;
}

function getValueExpressionForHeader({
    header,
    context,
    requestParameter
}: {
    header: FernIr.HttpHeader;
    context: FileContext;
    requestParameter: RequestParameter | undefined;
}): ts.Expression {
    const literalValue = getLiteralValueForHeader(header, context);
    if (literalValue != null) {
        return ts.factory.createStringLiteral(literalValue.toString());
    } else if (requestParameter == null) {
        throw new Error(
            `Cannot reference header ${getWireValue(header.name)} because request parameter is not defined.`
        );
    } else {
        const needsStringify = typeNeedsStringify(header.valueType, context);
        let valueExpression: ts.Expression;
        if (!needsStringify) {
            valueExpression = requestParameter.getReferenceToNonLiteralHeader(header, context);
        } else {
            valueExpression = context.type.stringify(
                requestParameter.getReferenceToNonLiteralHeader(header, context),
                header.valueType,
                { includeNullCheckIfOptional: true }
            );
        }
        // If clientDefault is set, add a fallback: value ?? "clientDefault"
        // Skip when the type is nullable — explicit null means "don't send the header",
        // and ?? would replace null with the clientDefault, preventing intentional omission.
        const clientDefaultVal = getClientDefaultValue(header.clientDefault);
        if (clientDefaultVal != null && !typeContainsNullable(header.valueType, context)) {
            valueExpression = ts.factory.createBinaryExpression(
                valueExpression,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                typeof clientDefaultVal === "boolean"
                    ? ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(
                              clientDefaultVal ? ts.factory.createTrue() : ts.factory.createFalse(),
                              ts.factory.createIdentifier("toString")
                          ),
                          undefined,
                          []
                      )
                    : ts.factory.createStringLiteral(clientDefaultVal.toString())
            );
        }
        // If the header type is nullable, convert null to undefined using ?? undefined.
        // HTTP headers don't have a "null" concept — they're either present with a value
        // or absent. This ensures null values are treated as "don't send the header".
        if (typeContainsNullable(header.valueType, context)) {
            return ts.factory.createBinaryExpression(
                valueExpression,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                ts.factory.createIdentifier("undefined")
            );
        }
        return valueExpression;
    }
}

function getValueExpressionForIdempotencyHeader({
    header,
    context
}: {
    header: FernIr.HttpHeader;
    context: FileContext;
}): ts.Expression {
    const literalValue = getLiteralValueForHeader(header, context);
    if (literalValue != null) {
        return ts.factory.createStringLiteral(literalValue.toString());
    } else {
        const needsStringify = typeNeedsStringify(header.valueType, context);
        const reference = ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier(context.case.camelUnsafe(header.name))
        );
        let valueExpression: ts.Expression;
        if (!needsStringify) {
            valueExpression = reference;
        } else {
            valueExpression = context.type.stringify(
                reference,
                // since we know request options is optional, the entire expression is optional
                // so we wrap the valuetype in an optional container to force null check
                FernIr.TypeReference.container(FernIr.ContainerType.optional(header.valueType)),
                { includeNullCheckIfOptional: true }
            );
        }
        // If the header type is nullable, convert null to undefined using ?? undefined.
        // HTTP headers don't have a "null" concept — they're either present with a value
        // or absent. This ensures null values are treated as "don't send the header".
        if (typeContainsNullable(header.valueType, context)) {
            return ts.factory.createBinaryExpression(
                valueExpression,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                ts.factory.createIdentifier("undefined")
            );
        }
        return valueExpression;
    }
}

function getOverridableRootHeaders({
    context,
    intermediateRepresentation
}: {
    context: FileContext;
    intermediateRepresentation: FernIr.IntermediateRepresentation;
}): GeneratedHeader[] {
    const headers: GeneratedHeader[] = [
        ...intermediateRepresentation.headers
            // auth headers are handled separately
            .filter((header) => !isAuthorizationHeader(header))
            .map((header) => {
                const headerName = getOptionKeyForHeader(header, context);
                const literalValue = getLiteralValueForHeader(header, context);

                let value: ts.Expression;
                if (literalValue != null) {
                    if (typeof literalValue === "boolean") {
                        const booleanLiteral = literalValue ? ts.factory.createTrue() : ts.factory.createFalse();
                        value = ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createParenthesizedExpression(
                                    ts.factory.createBinaryExpression(
                                        ts.factory.createPropertyAccessChain(
                                            ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                                            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                            ts.factory.createIdentifier(headerName)
                                        ),
                                        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                        booleanLiteral
                                    )
                                ),
                                ts.factory.createIdentifier("toString")
                            ),
                            undefined,
                            []
                        );
                    } else {
                        value = ts.factory.createBinaryExpression(
                            ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                ts.factory.createIdentifier(headerName)
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                            ts.factory.createStringLiteral(literalValue.toString())
                        );
                    }
                } else {
                    const originalExpr = ts.factory.createPropertyAccessChain(
                        ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        getOptionKeyForHeader(header, context)
                    );

                    // Add nullish coalescing with this._options.{header}
                    let fallbackExpr: ts.Expression = ts.factory.createPropertyAccessChain(
                        ts.factory.createPropertyAccessChain(
                            ts.factory.createThis(),
                            undefined,
                            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
                        ),
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        ts.factory.createIdentifier(getOptionKeyForHeader(header, context))
                    );

                    // If clientDefault is set, chain it as final fallback:
                    // requestOptions?.header ?? this._options?.header ?? "clientDefault"
                    // Skip when the type is nullable — explicit null means "don't send the header".
                    const clientDefaultVal = getClientDefaultValue(header.clientDefault);
                    if (clientDefaultVal != null && !typeContainsNullable(header.valueType, context)) {
                        if (typeof clientDefaultVal === "boolean") {
                            const booleanLiteral = clientDefaultVal
                                ? ts.factory.createTrue()
                                : ts.factory.createFalse();
                            fallbackExpr = ts.factory.createCallExpression(
                                ts.factory.createPropertyAccessExpression(
                                    ts.factory.createParenthesizedExpression(
                                        ts.factory.createBinaryExpression(
                                            fallbackExpr,
                                            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                            booleanLiteral
                                        )
                                    ),
                                    ts.factory.createIdentifier("toString")
                                ),
                                undefined,
                                []
                            );
                        } else {
                            fallbackExpr = ts.factory.createBinaryExpression(
                                fallbackExpr,
                                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                                ts.factory.createStringLiteral(clientDefaultVal.toString())
                            );
                        }
                    }

                    value = ts.factory.createBinaryExpression(
                        originalExpr,
                        ts.SyntaxKind.QuestionQuestionToken,
                        fallbackExpr
                    );
                }

                return {
                    header: getWireValue(header.name),
                    value
                };
            })
    ];

    const generatedVersion = context.versionContext.getGeneratedVersion();
    if (generatedVersion != null) {
        const header = generatedVersion.getHeader();
        const headerName = getOptionKeyForHeader(header, context);

        headers.push({
            header: getWireValue(header.name),
            value: ts.factory.createPropertyAccessChain(
                ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier(headerName)
            )
        });
    }

    return headers;
}

function isAuthorizationHeader(header: FernIr.HttpHeader | FernIr.HeaderAuthScheme): boolean {
    const wireValue = getWireValue(header.name);
    return wireValue.toLowerCase() === "authorization";
}

function getOptionKeyForHeader(header: FernIr.HttpHeader, context: FileContext): string {
    return context.case.camelUnsafe(header.name);
}

export function typeContainsNullable(type: FernIr.TypeReference, context: FileContext): boolean {
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

function typeNeedsStringify(type: FernIr.TypeReference, context: FileContext): boolean {
    return type._visit({
        container: (containerType) => {
            return containerType._visit({
                list: () => true,
                map: () => true,
                set: () => true,
                literal: () => false,
                optional: (innerType) => typeNeedsStringify(innerType, context),
                nullable: (innerType) => typeNeedsStringify(innerType, context),
                _other: () => true
            });
        },
        named: (namedType) => {
            const declaration = context.type.getTypeDeclaration(namedType);
            return declaration.shape._visit({
                alias: (alias) => typeNeedsStringify(alias.aliasOf, context),
                enum: () => false,
                object: () => true,
                union: () => true,
                undiscriminatedUnion: () => true,
                _other: () => true
            });
        },
        primitive: (primitiveType) => {
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
        },
        unknown: () => true,
        _other: () => true
    });
}
