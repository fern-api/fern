import { HttpMethod } from "@fern-fern/ir-sdk/api";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

/**
 * Generates a throw statement for handling global status code errors (default case).
 * This is used when no endpoint-specific error matches the status code.
 */
export function generateGlobalStatusCodeErrorThrow({
    context,
    referenceToError,
    referenceToRawResponse
}: {
    context: SdkContext;
    referenceToError: ts.Expression;
    referenceToRawResponse: ts.Expression;
}): ts.ThrowStatement {
    return ts.factory.createThrowStatement(
        context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
            message: undefined,
            statusCode: ts.factory.createPropertyAccessExpression(
                referenceToError,
                context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.statusCode
            ),
            responseBody: ts.factory.createPropertyAccessExpression(
                referenceToError,
                context.coreUtilities.fetcher.Fetcher.FailedStatusCodeError.body
            ),
            rawResponse: referenceToRawResponse
        })
    );
}

/**
 * Generates statements for handling non-status-code errors (non-json, timeout, unknown).
 * These are global error cases that apply to all endpoints.
 */
export function generateNonStatusCodeErrorHandling({
    context,
    referenceToError,
    referenceToRawResponse,
    endpointMethod,
    endpointPath
}: {
    context: SdkContext;
    referenceToError: ts.Expression;
    referenceToRawResponse: ts.Expression;
    endpointMethod: HttpMethod;
    endpointPath: string;
}): ts.Statement {
    return ts.factory.createSwitchStatement(
        ts.factory.createPropertyAccessExpression(referenceToError, context.coreUtilities.fetcher.Fetcher.Error.reason),
        ts.factory.createCaseBlock([
            ts.factory.createCaseClause(
                ts.factory.createStringLiteral(context.coreUtilities.fetcher.Fetcher.NonJsonError._reasonLiteralValue),
                [
                    ts.factory.createThrowStatement(
                        context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                            message: undefined,
                            statusCode: ts.factory.createPropertyAccessExpression(
                                referenceToError,
                                context.coreUtilities.fetcher.Fetcher.NonJsonError.statusCode
                            ),
                            responseBody: ts.factory.createPropertyAccessExpression(
                                referenceToError,
                                context.coreUtilities.fetcher.Fetcher.NonJsonError.rawBody
                            ),
                            rawResponse: referenceToRawResponse
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
                        context.timeoutSdkError
                            .getGeneratedTimeoutSdkError()
                            .build(context, `Timeout exceeded when calling ${endpointMethod} ${endpointPath}.`)
                    )
                ]
            ),
            ts.factory.createCaseClause(
                ts.factory.createStringLiteral(context.coreUtilities.fetcher.Fetcher.UnknownError._reasonLiteralValue),
                [
                    ts.factory.createThrowStatement(
                        context.genericAPISdkError.getGeneratedGenericAPISdkError().build(context, {
                            message: ts.factory.createPropertyAccessExpression(
                                referenceToError,
                                context.coreUtilities.fetcher.Fetcher.UnknownError.message
                            ),
                            statusCode: undefined,
                            responseBody: undefined,
                            rawResponse: referenceToRawResponse
                        })
                    )
                ]
            )
        ])
    );
}
