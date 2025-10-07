import { getTextOfTsNode } from "@fern-typescript/commons";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export const REQUEST_OPTIONS_PARAMETER_NAME = "requestOptions";
export const REQUEST_OPTIONS_ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME = "queryParams";

export const getRequestOptionsParameter = ({
    requestOptionsReference
}: {
    requestOptionsReference: ts.TypeReferenceNode;
}): OptionalKind<ParameterDeclarationStructure> => {
    return {
        name: REQUEST_OPTIONS_PARAMETER_NAME,
        type: getTextOfTsNode(requestOptionsReference),
        hasQuestionToken: true
    };
};

export const getTimeoutExpression = ({
    defaultTimeoutInSeconds,
    timeoutInSecondsReference,
    referenceToOptions
}: {
    defaultTimeoutInSeconds: number | "infinity" | undefined;
    timeoutInSecondsReference: (args: {
        referenceToRequestOptions: ts.Expression;
        isNullable: boolean;
    }) => ts.Expression;
    referenceToOptions: ts.Expression;
}): ts.Expression => {
    const requestOptionsTimeout = timeoutInSecondsReference({
        referenceToRequestOptions: ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
        isNullable: true
    });

    // Generate this._options?.timeoutInSeconds
    const referenceToClientLevelTimeoutInSeconds = ts.factory.createPropertyAccessChain(
        referenceToOptions,
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier("timeoutInSeconds")
    );

    // If infinity case and no overrides, return undefined; otherwise multiply by 1000
    // requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : (this._options?.timeoutInSeconds != null ? this._options.timeoutInSeconds * 1000 : undefined)
    if (defaultTimeoutInSeconds === "infinity") {
        return ts.factory.createConditionalExpression(
            ts.factory.createBinaryExpression(
                requestOptionsTimeout,
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
            ts.factory.createConditionalExpression(
                ts.factory.createBinaryExpression(
                    referenceToClientLevelTimeoutInSeconds,
                    ts.factory.createToken(ts.SyntaxKind.ExclamationEqualsToken),
                    ts.factory.createIdentifier("null")
                ),
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                ts.factory.createParenthesizedExpression(
                    ts.factory.createBinaryExpression(
                        referenceToClientLevelTimeoutInSeconds,
                        ts.factory.createToken(ts.SyntaxKind.AsteriskToken),
                        ts.factory.createNumericLiteral("1000")
                    )
                ),
                ts.factory.createToken(ts.SyntaxKind.ColonToken),
                ts.factory.createIdentifier("undefined")
            )
        );
    }

    // Otherwise we can use a tighter expression:
    const timeoutInSecondsChain = ts.factory.createBinaryExpression(
        ts.factory.createBinaryExpression(
            requestOptionsTimeout,
            ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
            referenceToClientLevelTimeoutInSeconds
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
        ts.factory.createNumericLiteral(defaultTimeoutInSeconds ?? 60)
    );

    // (requestOptions?.timeoutInSeconds ?? this._options?.timeoutInSeconds ?? 60) * 1000
    return ts.factory.createBinaryExpression(
        ts.factory.createParenthesizedExpression(timeoutInSecondsChain),
        ts.factory.createToken(ts.SyntaxKind.AsteriskToken),
        ts.factory.createNumericLiteral("1000")
    );
};

export const getMaxRetriesExpression = ({
    maxRetriesReference,
    referenceToOptions
}: {
    maxRetriesReference: (args: { referenceToRequestOptions: ts.Expression; isNullable: boolean }) => ts.Expression;
    referenceToOptions: ts.Expression;
}): ts.Expression => {
    const requestOptionsMaxRetries = maxRetriesReference({
        referenceToRequestOptions: ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME),
        isNullable: true
    });

    // this._options?.maxRetries
    const referenceToDefaultMaxRetries = ts.factory.createPropertyAccessChain(
        referenceToOptions,
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier("maxRetries")
    );

    // requestOptions?.maxRetries ?? this._options?.maxRetries
    return ts.factory.createBinaryExpression(
        requestOptionsMaxRetries,
        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
        referenceToDefaultMaxRetries
    );
};

export const getAbortSignalExpression = ({
    abortSignalReference
}: {
    abortSignalReference: (args: { referenceToRequestOptions: ts.Expression }) => ts.Expression;
}): ts.Expression => {
    return abortSignalReference({
        referenceToRequestOptions: ts.factory.createIdentifier(REQUEST_OPTIONS_PARAMETER_NAME)
    });
};
