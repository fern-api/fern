import { getTextOfTsNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import {
    getAbortSignalExpression,
    getMaxRetriesExpression,
    getRequestOptionsParameter,
    getTimeoutExpression,
    REQUEST_OPTIONS_PARAMETER_NAME
} from "../endpoints/utils/requestOptionsParameter.js";

describe("requestOptionsParameter", () => {
    describe("getRequestOptionsParameter", () => {
        it("generates parameter with question token", () => {
            const requestOptionsReference = ts.factory.createTypeReferenceNode("RequestOptions");
            const result = getRequestOptionsParameter({ requestOptionsReference });

            expect(result.name).toBe(REQUEST_OPTIONS_PARAMETER_NAME);
            expect(result.hasQuestionToken).toBe(true);
            expect(result.type).toBe("RequestOptions");
        });

        it("generates parameter with qualified type reference", () => {
            const requestOptionsReference = ts.factory.createTypeReferenceNode(
                ts.factory.createQualifiedName(
                    ts.factory.createIdentifier("MyClient"),
                    ts.factory.createIdentifier("RequestOptions")
                )
            );
            const result = getRequestOptionsParameter({ requestOptionsReference });

            expect(result.name).toBe(REQUEST_OPTIONS_PARAMETER_NAME);
            expect(result.type).toBe("MyClient.RequestOptions");
        });
    });

    describe("getTimeoutExpression", () => {
        const referenceToOptions = ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            ts.factory.createIdentifier("_options")
        );

        const timeoutInSecondsReference = ({
            referenceToRequestOptions,
            isNullable
        }: {
            referenceToRequestOptions: ts.Expression;
            isNullable: boolean;
        }) => {
            if (isNullable) {
                return ts.factory.createPropertyAccessChain(
                    referenceToRequestOptions,
                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                    ts.factory.createIdentifier("timeoutInSeconds")
                );
            }
            return ts.factory.createPropertyAccessExpression(
                referenceToRequestOptions,
                ts.factory.createIdentifier("timeoutInSeconds")
            );
        };

        it("generates timeout with default 60 seconds", () => {
            const result = getTimeoutExpression({
                defaultTimeoutInSeconds: undefined,
                timeoutInSecondsReference,
                referenceToOptions
            });

            const text = getTextOfTsNode(result);
            expect(text).toMatchSnapshot();
        });

        it("generates timeout with custom default seconds", () => {
            const result = getTimeoutExpression({
                defaultTimeoutInSeconds: 30,
                timeoutInSecondsReference,
                referenceToOptions
            });

            const text = getTextOfTsNode(result);
            expect(text).toMatchSnapshot();
        });

        it("generates timeout with infinity default", () => {
            const result = getTimeoutExpression({
                defaultTimeoutInSeconds: "infinity",
                timeoutInSecondsReference,
                referenceToOptions
            });

            const text = getTextOfTsNode(result);
            expect(text).toMatchSnapshot();
        });
    });

    describe("getMaxRetriesExpression", () => {
        it("generates max retries with nullish coalescing", () => {
            const referenceToOptions = ts.factory.createPropertyAccessExpression(
                ts.factory.createThis(),
                ts.factory.createIdentifier("_options")
            );

            const maxRetriesReference = ({
                referenceToRequestOptions,
                isNullable
            }: {
                referenceToRequestOptions: ts.Expression;
                isNullable: boolean;
            }) => {
                if (isNullable) {
                    return ts.factory.createPropertyAccessChain(
                        referenceToRequestOptions,
                        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                        ts.factory.createIdentifier("maxRetries")
                    );
                }
                return ts.factory.createPropertyAccessExpression(
                    referenceToRequestOptions,
                    ts.factory.createIdentifier("maxRetries")
                );
            };

            const result = getMaxRetriesExpression({
                maxRetriesReference,
                referenceToOptions
            });

            const text = getTextOfTsNode(result);
            expect(text).toMatchSnapshot();
        });
    });

    describe("getAbortSignalExpression", () => {
        it("generates abort signal reference", () => {
            const abortSignalReference = ({
                referenceToRequestOptions
            }: {
                referenceToRequestOptions: ts.Expression;
            }) => {
                return ts.factory.createPropertyAccessChain(
                    referenceToRequestOptions,
                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                    ts.factory.createIdentifier("abortSignal")
                );
            };

            const result = getAbortSignalExpression({
                abortSignalReference
            });

            const text = getTextOfTsNode(result);
            expect(text).toMatchSnapshot();
        });
    });
});
