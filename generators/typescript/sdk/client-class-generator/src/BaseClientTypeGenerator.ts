import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
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

    constructor({
        generateIdempotentRequestOptions,
        errorResolver,
        intermediateRepresentation
    }: BaseClientTypeGenerator.Init) {
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;
        this.errorResolver = errorResolver;
        this.intermediateRepresentation = intermediateRepresentation;
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
        const globalErrorIds = this.intermediateRepresentation.rootPackage.errors;

        for (const errorId of globalErrorIds) {
            const error = this.intermediateRepresentation.errors[errorId];
            if (error == null) {
                continue;
            }

            const errorDeclaration = this.errorResolver.getErrorDeclarationFromName(error.name);
            const generatedSdkError = context.sdkError.getGeneratedSdkError(error.name);

            if (generatedSdkError?.type !== "class") {
                continue;
            }

            switchCases.push(
                ts.factory.createCaseClause(ts.factory.createNumericLiteral(errorDeclaration.statusCode), [
                    ts.factory.createThrowStatement(
                        generatedSdkError.build(context, {
                            referenceToBody: ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("error"),
                                "body"
                            ),
                            referenceToRawResponse: ts.factory.createIdentifier("rawResponse")
                        })
                    )
                ])
            );
        }

        switchCases.push(
            ts.factory.createDefaultClause([
                ts.factory.createThrowStatement(
                    context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                        message: undefined,
                        statusCode: ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("error"),
                            "statusCode"
                        ),
                        responseBody: ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("error"),
                            "body"
                        ),
                        rawResponse: ts.factory.createIdentifier("rawResponse")
                    })
                )
            ])
        );

        const switchStatement = ts.factory.createSwitchStatement(
            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("error"), "statusCode"),
            ts.factory.createCaseBlock(switchCases)
        );

        return ts.factory.createFunctionDeclaration(
            undefined,
            [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
            undefined,
            "handleGlobalStatusCodeError",
            undefined,
            [errorParameter, rawResponseParameter],
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
            ts.factory.createBlock([switchStatement], true)
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
