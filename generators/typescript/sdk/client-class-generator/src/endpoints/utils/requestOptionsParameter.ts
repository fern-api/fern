import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { OptionalKind, ParameterDeclarationStructure, ts } from "ts-morph";

export const REQUEST_OPTIONS_PARAMETER_NAME = "requestOptions";
export const REQUEST_OPTIONS_ADDITIONAL_QUERY_PARAMETERS_PROPERTY_NAME = "queryParams";
export const REQUEST_OPTIONS_ADDITIONAL_BODY_PARAMETERS_PROPERTY_NAME = "additionalBodyParameters";

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
    defaultTimeout,
    timeoutInSecondsReference,
    referenceToOptions
}: {
    /** Effective default timeout in milliseconds (`"infinity"` disables it). */
    defaultTimeout: number | "infinity" | undefined;
    timeoutInSecondsReference: (args: {
        referenceToRequestOptions: ts.Expression;
        isNullable: boolean;
    }) => ts.Expression;
    referenceToOptions: ts.Expression;
}): ts.Expression => {
    // The generated SDK's runtime timeout option is expressed in seconds and multiplied by 1000
    // at the call site, so convert the resolved millisecond default back into seconds for the
    // emitted literal. This keeps generated output identical to the seconds-based config.
    const defaultTimeoutInSeconds =
        defaultTimeout === "infinity" ? "infinity" : defaultTimeout != null ? defaultTimeout / 1000 : undefined;

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
    endpoint,
    maxRetriesReference,
    referenceToOptions
}: {
    endpoint: Pick<FernIr.HttpEndpoint, "retries">;
    maxRetriesReference: (args: { referenceToRequestOptions: ts.Expression; isNullable: boolean }) => ts.Expression;
    referenceToOptions: ts.Expression;
}): ts.Expression => {
    // Endpoints with retries explicitly disabled never retry, regardless of client- or request-level config.
    if (endpoint.retries?.disabled === true) {
        return ts.factory.createNumericLiteral("0");
    }

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
