import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedNonStatusCodeErrorHandlerImpl } from "../non-status-code-error-handler/GeneratedNonStatusCodeErrorHandlerImpl.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function createMockFileContext() {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");
    return {
        sourceFile,
        coreUtilities: {
            fetcher: {
                Fetcher: {
                    Error: {
                        _getReferenceToType: () => ts.factory.createTypeReferenceNode("Fetcher.Error"),
                        reason: "reason"
                    },
                    NonJsonError: {
                        _reasonLiteralValue: "non-json",
                        statusCode: "statusCode",
                        rawBody: "rawBody"
                    },
                    BodyIsNullError: {
                        _reasonLiteralValue: "body-is-null",
                        statusCode: "statusCode"
                    },
                    TimeoutSdkError: {
                        _reasonLiteralValue: "timeout",
                        cause: "cause"
                    },
                    UnknownError: {
                        _reasonLiteralValue: "unknown",
                        message: "message",
                        cause: "cause"
                    }
                },
                RawResponse: {
                    RawResponse: {
                        _getReferenceToType: () => ts.factory.createTypeReferenceNode("RawResponse")
                    }
                }
            }
        },
        genericAPISdkError: {
            getGeneratedGenericAPISdkError: () => ({
                build: (
                    _context: unknown,
                    args: {
                        message: ts.Expression | undefined;
                        statusCode: ts.Expression | undefined;
                        responseBody: ts.Expression | undefined;
                        rawResponse: ts.Expression;
                        cause?: ts.Expression | undefined;
                    }
                ) => {
                    const props: ts.ObjectLiteralElementLike[] = [];
                    if (args.message != null) {
                        props.push(ts.factory.createPropertyAssignment("message", args.message));
                    }
                    if (args.statusCode != null) {
                        props.push(ts.factory.createPropertyAssignment("statusCode", args.statusCode));
                    }
                    if (args.responseBody != null) {
                        props.push(ts.factory.createPropertyAssignment("body", args.responseBody));
                    }
                    props.push(ts.factory.createPropertyAssignment("rawResponse", args.rawResponse));
                    if (args.cause != null) {
                        props.push(ts.factory.createPropertyAssignment("cause", args.cause));
                    }
                    return ts.factory.createNewExpression(ts.factory.createIdentifier("ApiError"), undefined, [
                        ts.factory.createObjectLiteralExpression(props, true)
                    ]);
                }
            })
        },
        timeoutSdkError: {
            getReferenceToTimeoutSdkError: () => ({
                getExpression: () => ts.factory.createIdentifier("TimeoutError")
            })
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedNonStatusCodeErrorHandlerImpl", () => {
    it("writes handleNonStatusCodeError function", () => {
        const impl = new GeneratedNonStatusCodeErrorHandlerImpl();
        const context = createMockFileContext();
        impl.writeToFile(context);
        expect(context.sourceFile.getFullText()).toMatchSnapshot();
    });

    it("generates exported function with correct parameters", () => {
        const impl = new GeneratedNonStatusCodeErrorHandlerImpl();
        const context = createMockFileContext();
        impl.writeToFile(context);
        const text = context.sourceFile.getFullText();
        expect(text).toContain("export function handleNonStatusCodeError");
        expect(text).toContain("error: Fetcher.Error");
        expect(text).toContain("rawResponse: RawResponse");
        expect(text).toContain("method: string");
        expect(text).toContain("path: string");
        expect(text).toContain(": never");
    });

    it("generates switch on error.reason", () => {
        const impl = new GeneratedNonStatusCodeErrorHandlerImpl();
        const context = createMockFileContext();
        impl.writeToFile(context);
        const text = context.sourceFile.getFullText();
        expect(text).toContain("switch (error.reason)");
    });

    it("handles non-json error case", () => {
        const impl = new GeneratedNonStatusCodeErrorHandlerImpl();
        const context = createMockFileContext();
        impl.writeToFile(context);
        const text = context.sourceFile.getFullText();
        expect(text).toContain('"non-json"');
        expect(text).toContain("error.statusCode");
        expect(text).toContain("error.rawBody");
    });

    it("handles body-is-null error case", () => {
        const impl = new GeneratedNonStatusCodeErrorHandlerImpl();
        const context = createMockFileContext();
        impl.writeToFile(context);
        const text = context.sourceFile.getFullText();
        expect(text).toContain('"body-is-null"');
    });

    it("handles timeout error case with template literal", () => {
        const impl = new GeneratedNonStatusCodeErrorHandlerImpl();
        const context = createMockFileContext();
        impl.writeToFile(context);
        const text = context.sourceFile.getFullText();
        expect(text).toContain('"timeout"');
        expect(text).toContain("TimeoutError");
        expect(text).toContain("Timeout exceeded when calling");
    });

    it("handles unknown error case", () => {
        const impl = new GeneratedNonStatusCodeErrorHandlerImpl();
        const context = createMockFileContext();
        impl.writeToFile(context);
        const text = context.sourceFile.getFullText();
        expect(text).toContain('"unknown"');
        expect(text).toContain("error.message");
    });

    it("includes default case", () => {
        const impl = new GeneratedNonStatusCodeErrorHandlerImpl();
        const context = createMockFileContext();
        impl.writeToFile(context);
        const text = context.sourceFile.getFullText();
        expect(text).toContain("default:");
        expect(text).toContain('"Unknown error"');
    });
});
