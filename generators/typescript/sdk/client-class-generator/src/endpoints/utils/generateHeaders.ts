import { FernIr } from "@fern-fern/ir-sdk";
import {
    HeaderAuthScheme,
    HttpEndpoint,
    HttpHeader,
    HttpService,
    IntermediateRepresentation
} from "@fern-fern/ir-sdk/api";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { GeneratedHeader } from "../../GeneratedHeader";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";
import { RequestParameter } from "../../request-parameter/RequestParameter";
import { getLiteralValueForHeader } from "./isLiteralHeader";
import { REQUEST_OPTIONS_PARAMETER_NAME } from "./requestOptionsParameter";

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
    context: SdkContext;
    intermediateRepresentation: IntermediateRepresentation;
    generatedSdkClientClass: GeneratedSdkClientClassImpl;
    requestParameter: RequestParameter | undefined;
    service: HttpService;
    endpoint: HttpEndpoint;
    idempotencyHeaders: HttpHeader[];
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
            header: header.name.wireValue,
            value: getValueExpressionForHeader({ header, context, requestParameter })
        });
    }

    if (endpoint.idempotent) {
        for (const header of idempotencyHeaders) {
            elements.push({
                header: header.name.wireValue,
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
    header: HttpHeader;
    context: SdkContext;
    requestParameter: RequestParameter | undefined;
}): ts.Expression {
    const literalValue = getLiteralValueForHeader(header, context);
    if (literalValue != null) {
        return ts.factory.createStringLiteral(literalValue.toString());
    } else if (requestParameter == null) {
        throw new Error(`Cannot reference header ${header.name.wireValue} because request parameter is not defined.`);
    } else {
        return context.type.stringify(
            requestParameter.getReferenceToNonLiteralHeader(header, context),
            header.valueType,
            { includeNullCheckIfOptional: true }
        );
    }
}

function getValueExpressionForIdempotencyHeader({
    header,
    context
}: {
    header: HttpHeader;
    context: SdkContext;
}): ts.Expression {
    const literalValue = getLiteralValueForHeader(header, context);
    if (literalValue != null) {
        return ts.factory.createStringLiteral(literalValue.toString());
    } else {
        return context.type.stringify(
            ts.factory.createPropertyAccessChain(
                ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier(header.name.name.camelCase.unsafeName)
            ),
            header.valueType,
            { includeNullCheckIfOptional: true }
        );
    }
}

function getOverridableRootHeaders({
    context,
    intermediateRepresentation
}: {
    context: SdkContext;
    intermediateRepresentation: FernIr.IntermediateRepresentation;
}): GeneratedHeader[] {
    const headers: GeneratedHeader[] = [
        ...intermediateRepresentation.headers
            // auth headers are handled separately
            .filter((header) => !isAuthorizationHeader(header))
            .map((header) => {
                const headerName = getOptionKeyForHeader(header);
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
                        getOptionKeyForHeader(header)
                    );

                    // Add nullish coalescing with this._options.{header}
                    value = ts.factory.createBinaryExpression(
                        originalExpr,
                        ts.SyntaxKind.QuestionQuestionToken,
                        ts.factory.createPropertyAccessChain(
                            ts.factory.createPropertyAccessChain(
                                ts.factory.createThis(),
                                undefined,
                                GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                            ts.factory.createIdentifier(getOptionKeyForHeader(header))
                        )
                    );
                }

                return {
                    header: header.name.wireValue,
                    value
                };
            })
    ];

    const generatedVersion = context.versionContext.getGeneratedVersion();
    if (generatedVersion != null) {
        const header = generatedVersion.getHeader();
        const headerName = getOptionKeyForHeader(header);

        headers.push({
            header: header.name.wireValue,
            value: ts.factory.createPropertyAccessChain(
                ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                ts.factory.createIdentifier(headerName)
            )
        });
    }

    return headers;
}

function isAuthorizationHeader(header: HttpHeader | HeaderAuthScheme): boolean {
    return header.name.wireValue.toLowerCase() === "authorization";
}

function getOptionKeyForHeader(header: HttpHeader): string {
    return header.name.name.camelCase.unsafeName;
}
