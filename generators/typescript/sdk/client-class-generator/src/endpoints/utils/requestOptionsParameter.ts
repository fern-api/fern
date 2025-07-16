import { getTextOfTsNode } from "@fern-typescript/commons"
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph"

export const REQUEST_OPTIONS_PARAMETER_NAME = "requestOptions"

export const getRequestOptionsParameter = ({
    requestOptionsReference
}: {
    requestOptionsReference: ts.TypeReferenceNode
}): OptionalKind<ParameterDeclarationStructure> => {
    return {
        name: REQUEST_OPTIONS_PARAMETER_NAME,
        type: getTextOfTsNode(requestOptionsReference),
        hasQuestionToken: true
    }
}

export const getTimeoutExpression = ({
    defaultTimeoutInSeconds,
    timeoutInSecondsReference
}: {
    defaultTimeoutInSeconds: number | "infinity" | undefined
    timeoutInSecondsReference: (args: {
        referenceToRequestOptions: ts.Expression
        isNullable: boolean
    }) => ts.Expression
}): ts.Expression => {
    return ts.factory.createConditionalExpression(
        ts.factory.createBinaryExpression(
            timeoutInSecondsReference({
                referenceToRequestOptions: ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                isNullable: true
            }),
            ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
            ts.factory.createIdentifier("null")
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createParenthesizedExpression(
            ts.factory.createBinaryExpression(
                timeoutInSecondsReference({
                    referenceToRequestOptions: ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
                    isNullable: false
                }),
                ts.factory.createToken(ts.SyntaxKind.AsteriskToken),
                ts.factory.createNumericLiteral("1000")
            )
        ),
        ts.factory.createToken(ts.SyntaxKind.ColonToken),
        // If defaultTimeoutInSeconds is set to infinity, fall back to undefined if requestOptions.timeoutInSeconds is not set
        defaultTimeoutInSeconds !== "infinity"
            ? ts.factory.createNumericLiteral(defaultTimeoutInSeconds != null ? defaultTimeoutInSeconds * 1000 : 60000)
            : ts.factory.createIdentifier("undefined")
    )
}

export const getMaxRetriesExpression = ({
    maxRetriesReference
}: {
    maxRetriesReference: (args: { referenceToRequestOptions: ts.Expression; isNullable: boolean }) => ts.Expression
}): ts.Expression => {
    return maxRetriesReference({
        referenceToRequestOptions: ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
        isNullable: true
    })
}

export const getAbortSignalExpression = ({
    abortSignalReference
}: {
    abortSignalReference: (args: { referenceToRequestOptions: ts.Expression }) => ts.Expression
}): ts.Expression => {
    return abortSignalReference({
        referenceToRequestOptions: ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME)
    })
}
