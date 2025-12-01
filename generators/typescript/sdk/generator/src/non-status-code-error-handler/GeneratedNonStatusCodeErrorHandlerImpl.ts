import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export class GeneratedNonStatusCodeErrorHandlerImpl {
    public writeToFile(context: SdkContext): void {
        const errorType = context.coreUtilities.fetcher.Fetcher.Error._getReferenceToType();
        const rawResponseType = context.coreUtilities.fetcher.RawResponse.RawResponse._getReferenceToType();

        const errorParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            ts.factory.createIdentifier("error"),
            undefined,
            errorType
        );

        const rawResponseParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            ts.factory.createIdentifier("rawResponse"),
            undefined,
            rawResponseType
        );

        const methodParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            ts.factory.createIdentifier("method"),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        );

        const pathParameter = ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            ts.factory.createIdentifier("path"),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
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
                        context.coreUtilities.fetcher.Fetcher.BodyIsNullError._reasonLiteralValue
                    ),
                    [
                        ts.factory.createThrowStatement(
                            context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                                message: undefined,
                                statusCode: ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("error"),
                                    context.coreUtilities.fetcher.Fetcher.BodyIsNullError.statusCode
                                ),
                                responseBody: undefined,
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

        const functionDeclaration = ts.factory.createFunctionDeclaration(
            undefined,
            [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
            undefined,
            "handleNonStatusCodeError",
            undefined,
            [errorParameter, rawResponseParameter, methodParameter, pathParameter],
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
            ts.factory.createBlock([switchStatement], true)
        );

        context.sourceFile.addStatements(getTextOfTsNode(functionDeclaration));
    }
}
