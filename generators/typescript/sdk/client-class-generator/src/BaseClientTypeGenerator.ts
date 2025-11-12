import { DeclaredErrorName, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ts } from "ts-morph";

export declare namespace BaseClientTypeGenerator {
    export interface Init {
        generateIdempotentRequestOptions: boolean;
        errorResolver: ErrorResolver;
        intermediateRepresentation: IntermediateRepresentation;
    }
}

export class BaseClientTypeGenerator {
    private readonly generateIdempotentRequestOptions: boolean;
    private readonly errorResolver: ErrorResolver;
    private readonly intermediateRepresentation: IntermediateRepresentation;
    private readonly globalErrorNames: Set<DeclaredErrorName>;

    constructor({
        generateIdempotentRequestOptions,
        errorResolver,
        intermediateRepresentation
    }: BaseClientTypeGenerator.Init) {
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;
        this.errorResolver = errorResolver;
        this.intermediateRepresentation = intermediateRepresentation;
        this.globalErrorNames = this.computeGlobalErrorNames();
    }

    private computeGlobalErrorNames(): Set<DeclaredErrorName> {
        const allServices = Object.values(this.intermediateRepresentation.services);
        if (allServices.length === 0) {
            return new Set();
        }

        const allEndpoints = allServices.flatMap((service) => service.endpoints);
        if (allEndpoints.length === 0) {
            return new Set();
        }

        const errorNamesByEndpoint = allEndpoints.map(
            (endpoint) => new Set(endpoint.errors.map((e) => JSON.stringify(e.error)))
        );

        if (errorNamesByEndpoint.length === 0) {
            return new Set();
        }

        const intersectionStrings = new Set(errorNamesByEndpoint[0]);
        for (let i = 1; i < errorNamesByEndpoint.length; i++) {
            for (const errorNameString of intersectionStrings) {
                if (!errorNamesByEndpoint[i]?.has(errorNameString)) {
                    intersectionStrings.delete(errorNameString);
                }
            }
        }

        return new Set(Array.from(intersectionStrings).map((s) => JSON.parse(s) as DeclaredErrorName));
    }

    public writeToFile(context: SdkContext): void {
        context.sourceFile.addInterface(context.baseClient.generateBaseClientOptionsInterface(context));
        context.sourceFile.addInterface(context.baseClient.generateBaseRequestOptionsInterface(context));
        if (this.generateIdempotentRequestOptions) {
            context.sourceFile.addInterface(context.baseClient.generateBaseIdempotentRequestOptionsInterface(context));
        }

        const errorHandlingFunctions = this.generateErrorHandlingFunctions(context);
        for (const func of errorHandlingFunctions) {
            context.sourceFile.addStatements(getTextOfTsNode(func));
        }
    }

    private generateErrorHandlingFunctions(context: SdkContext): ts.FunctionDeclaration[] {
        return [this.generateHandleGlobalStatusCodeError(context), this.generateHandleNonStatusCodeError(context)];
    }

    private generateHandleGlobalStatusCodeError(context: SdkContext): ts.FunctionDeclaration {
        const errorType = context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError._getReferenceToType();

        const errorParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            "error",
            undefined,
            errorType,
            undefined
        );

        const rawResponseParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            "rawResponse",
            undefined,
            context.coreUtilities.fetcher.RawResponse.RawResponse._getReferenceToType(),
            undefined
        );

        const switchCases: ts.CaseOrDefaultClause[] = [];

        for (const errorName of this.globalErrorNames) {
            const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(errorName);
            const generatedSdkError = context.sdkError.getGeneratedSdkError(errorName);
            const generatedSdkErrorSchema = context.sdkErrorSchema.getGeneratedSdkErrorSchema(errorName);

            if (generatedSdkError?.type !== "class") {
                continue;
            }

            const referenceToBody =
                generatedSdkErrorSchema != null
                    ? generatedSdkErrorSchema.deserializeBody(context, {
                          referenceToBody: ts.factory.createPropertyAccessExpression(
                              ts.factory.createIdentifier("error"),
                              "body"
                          )
                      })
                    : ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("error"), "body");

            switchCases.push(
                ts.factory.createCaseClause(ts.factory.createNumericLiteral(errorDeclaration.statusCode), [
                    ts.factory.createThrowStatement(
                        generatedSdkError.build(context, {
                            referenceToBody,
                            referenceToRawResponse: ts.factory.createIdentifier("rawResponse")
                        })
                    )
                ])
            );
        }

        const defaultThrowStatement = ts.factory.createThrowStatement(
            context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                message: undefined,
                statusCode: ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("error"),
                    "statusCode"
                ),
                responseBody: ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("error"), "body"),
                rawResponse: ts.factory.createIdentifier("rawResponse")
            })
        );

        const functionBody =
            switchCases.length === 0
                ? ts.factory.createBlock([defaultThrowStatement], true)
                : ts.factory.createBlock(
                      [
                          ts.factory.createSwitchStatement(
                              ts.factory.createPropertyAccessExpression(
                                  ts.factory.createIdentifier("error"),
                                  "statusCode"
                              ),
                              ts.factory.createCaseBlock([
                                  ...switchCases,
                                  ts.factory.createDefaultClause([defaultThrowStatement])
                              ])
                          )
                      ],
                      true
                  );

        return ts.factory.createFunctionDeclaration(
            undefined,
            [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
            undefined,
            "handleGlobalStatusCodeError",
            undefined,
            [errorParameter, rawResponseParameter],
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
            functionBody
        );
    }

    private generateHandleNonStatusCodeError(context: SdkContext): ts.FunctionDeclaration {
        const errorType = context.coreUtilities.fetcher.Fetcher.Error._getReferenceToType();

        const errorParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            "error",
            undefined,
            errorType,
            undefined
        );

        const rawResponseParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            "rawResponse",
            undefined,
            context.coreUtilities.fetcher.RawResponse.RawResponse._getReferenceToType(),
            undefined
        );

        const methodParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            "method",
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            undefined
        );

        const pathParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            "path",
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
            undefined
        );

        const switchStatement = ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("error"),
                context.coreUtilities.fetcher.Fetcher.Error.reason
            ),
            ts.factory.createCaseBlock([
                ts.factory.createCaseClause(
                    ts.factory.createStringLiteral(
                        context.coreUtilities.fetcher.Fetcher.NonJsonError._reasonLiteralValue
                    ),
                    [
                        ts.factory.createThrowStatement(
                            context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                message: undefined,
                                statusCode: ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("error"),
                                    context.coreUtilities.fetcher.Fetcher.NonJsonError.statusCode
                                ),
                                responseBody: ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("error"),
                                    context.coreUtilities.fetcher.Fetcher.NonJsonError.rawBody
                                ),
                                rawResponse: ts.factory.createIdentifier("rawResponse")
                            })
                        )
                    ]
                ),
                ts.factory.createCaseClause(
                    ts.factory.createStringLiteral(
                        context.coreUtilities.fetcher.Fetcher.TimeoutSdkError._reasonLiteralValue
                    ),
                    [
                        ts.factory.createThrowStatement(
                            ts.factory.createNewExpression(
                                context.timeoutSdkError.getReferenceToTimeoutSdkError().getExpression(),
                                undefined,
                                [
                                    ts.factory.createTemplateExpression(
                                        ts.factory.createTemplateHead("Timeout exceeded when calling "),
                                        [
                                            ts.factory.createTemplateSpan(
                                                ts.factory.createIdentifier("method"),
                                                ts.factory.createTemplateMiddle(" ")
                                            ),
                                            ts.factory.createTemplateSpan(
                                                ts.factory.createIdentifier("path"),
                                                ts.factory.createTemplateTail(".")
                                            )
                                        ]
                                    )
                                ]
                            )
                        )
                    ]
                ),
                ts.factory.createCaseClause(
                    ts.factory.createStringLiteral(
                        context.coreUtilities.fetcher.Fetcher.UnknownError._reasonLiteralValue
                    ),
                    [
                        ts.factory.createThrowStatement(
                            context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                message: ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("error"),
                                    context.coreUtilities.fetcher.Fetcher.UnknownError.message
                                ),
                                statusCode: undefined,
                                responseBody: undefined,
                                rawResponse: ts.factory.createIdentifier("rawResponse")
                            })
                        )
                    ]
                ),
                ts.factory.createDefaultClause([
                    ts.factory.createThrowStatement(
                        context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                            message: ts.factory.createStringLiteral("Unknown error"),
                            statusCode: undefined,
                            responseBody: undefined,
                            rawResponse: ts.factory.createIdentifier("rawResponse")
                        })
                    )
                ])
            ])
        );

        return ts.factory.createFunctionDeclaration(
            undefined,
            [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
            undefined,
            "handleNonStatusCodeError",
            undefined,
            [errorParameter, rawResponseParameter, methodParameter, pathParameter],
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
            ts.factory.createBlock([switchStatement], true)
        );
    }
}
