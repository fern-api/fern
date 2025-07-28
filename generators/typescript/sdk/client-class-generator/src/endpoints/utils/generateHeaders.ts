import { ExportsManager } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { FernIr } from "@fern-fern/ir-sdk";
import {
    HeaderAuthScheme,
    HttpEndpoint,
    HttpHeader,
    HttpService,
    IntermediateRepresentation
} from "@fern-fern/ir-sdk";

import { GeneratedHeader } from "../../GeneratedHeader";
import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl";
import { RequestParameter } from "../../request-parameter/RequestParameter";
import { getLiteralValueForHeader } from "./isLiteralHeader";
import { REQUEST_OPTIONS_PARAMETER_NAME } from "./requestOptionsParameter";

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
}): ts.Expression {
    const elements: GeneratedHeader[] = [];

    const authorizationHeaderValue = generatedSdkClientClass.getAuthorizationHeaderValue();
    if (authorizationHeaderValue != null) {
        elements.push({
            header: "Authorization",
            value: authorizationHeaderValue
        });
    }

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

    const customAuthorizationHeaderValue = generatedSdkClientClass.getCustomAuthorizationHeadersValue();
    if (customAuthorizationHeaderValue != null) {
        onlyDefinedHeaders.push(ts.factory.createSpreadAssignment(customAuthorizationHeaderValue));
    }

    for (const additionalSpreadHeader of additionalSpreadHeaders) {
        onlyDefinedHeaders.push(
            ts.factory.createSpreadAssignment(ts.factory.createParenthesizedExpression(additionalSpreadHeader))
        );
    }

    context.importsManager.addImportFromRoot("core/headers", {
        namedImports: ["mergeHeaders"]
    });

    const mergeHeadersArgs = [];
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

    return ts.factory.createCallExpression(ts.factory.createIdentifier("mergeHeaders"), undefined, mergeHeadersArgs);
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
                    value = ts.factory.createPropertyAccessChain(
                        ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        getOptionKeyForHeader(header)
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
