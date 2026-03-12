import { getTextOfTsNode, Reference } from "@fern-typescript/commons";
import { Project, ts } from "ts-morph";
import { assert, describe, expect, it } from "vitest";
import { GeneratedGenericAPISdkErrorImpl } from "../generic-api-error/GeneratedGenericAPISdkErrorImpl.js";
import { GenericAPISdkErrorGenerator } from "../generic-api-error/GenericAPISdkErrorGenerator.js";
import { GeneratedTimeoutSdkErrorImpl } from "../timeout-error/GeneratedTimeoutSdkErrorImpl.js";
import { TimeoutSdkErrorGenerator } from "../timeout-error/TimeoutSdkErrorGenerator.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function createMockReference(name: string): Reference {
    return {
        getExpression: () => ts.factory.createIdentifier(name),
        getTypeNode: () => ts.factory.createTypeReferenceNode(name),
        getEntityName: () => ts.factory.createIdentifier(name)
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createMockSdkContext() {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");
    return {
        sourceFile,
        coreUtilities: {
            fetcher: {
                RawResponse: {
                    RawResponse: {
                        _getReferenceToType: () => ts.factory.createTypeReferenceNode("RawResponse")
                    }
                }
            }
        },
        genericAPISdkError: {
            getReferenceToGenericAPISdkError: () => createMockReference("ApiError")
        },
        timeoutSdkError: {
            getReferenceToTimeoutSdkError: () => createMockReference("TimeoutError")
        },
        jsonContext: {
            getReferenceToToJson: () => createMockReference("toJson")
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

// ────────────────────────────────────────────────────────────────────────────
// GenericAPISdkErrorGenerator (factory)
// ────────────────────────────────────────────────────────────────────────────

describe("GenericAPISdkErrorGenerator", () => {
    it("creates a GeneratedGenericAPISdkError", () => {
        const generator = new GenericAPISdkErrorGenerator();
        const result = generator.generateGenericAPISdkError({ errorClassName: "MyApiError" });
        expect(result).toBeDefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedGenericAPISdkErrorImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedGenericAPISdkErrorImpl", () => {
    function createImpl(name?: string) {
        return new GeneratedGenericAPISdkErrorImpl({ errorClassName: name ?? "ApiError" });
    }

    describe("writeToFile", () => {
        it("writes error class with statusCode, body, and rawResponse properties", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            impl.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes error class with custom name", () => {
            const impl = createImpl("CustomApiError");
            const context = createMockSdkContext();
            impl.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });

    describe("build", () => {
        it("builds new expression with all parameters", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const result = impl.build(context, {
                message: ts.factory.createStringLiteral("something went wrong"),
                statusCode: ts.factory.createNumericLiteral(500),
                responseBody: ts.factory.createIdentifier("body"),
                rawResponse: ts.factory.createIdentifier("rawResp")
            });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds new expression with only message", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const result = impl.build(context, {
                message: ts.factory.createStringLiteral("error"),
                statusCode: undefined,
                responseBody: undefined,
                rawResponse: undefined
            });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds new expression with no parameters", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const result = impl.build(context, {
                message: undefined,
                statusCode: undefined,
                responseBody: undefined,
                rawResponse: undefined
            });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });
    });

    describe("buildConstructorArguments", () => {
        it("includes only non-null properties", () => {
            const impl = createImpl();
            const args = impl.buildConstructorArguments({
                message: ts.factory.createStringLiteral("msg"),
                statusCode: ts.factory.createNumericLiteral(400),
                responseBody: undefined,
                rawResponse: undefined
            });
            expect(args).toHaveLength(1);
            assert(args[0] != null, "expected constructor argument");
            expect(getTextOfTsNode(args[0])).toMatchSnapshot();
        });

        it("includes all properties when all provided", () => {
            const impl = createImpl();
            const args = impl.buildConstructorArguments({
                message: ts.factory.createStringLiteral("msg"),
                statusCode: ts.factory.createNumericLiteral(400),
                responseBody: ts.factory.createIdentifier("body"),
                rawResponse: ts.factory.createIdentifier("raw")
            });
            expect(args).toHaveLength(1);
            assert(args[0] != null, "expected constructor argument");
            expect(getTextOfTsNode(args[0])).toMatchSnapshot();
        });

        it("includes only responseBody and rawResponse when message and statusCode are undefined", () => {
            const impl = createImpl();
            const args = impl.buildConstructorArguments({
                message: undefined,
                statusCode: undefined,
                responseBody: ts.factory.createIdentifier("body"),
                rawResponse: ts.factory.createIdentifier("raw")
            });
            expect(args).toHaveLength(1);
            assert(args[0] != null, "expected constructor argument");
            expect(getTextOfTsNode(args[0])).toMatchSnapshot();
        });

        it("includes only message and rawResponse (statusCode and responseBody undefined)", () => {
            const impl = createImpl();
            const args = impl.buildConstructorArguments({
                message: ts.factory.createStringLiteral("error"),
                statusCode: undefined,
                responseBody: undefined,
                rawResponse: ts.factory.createIdentifier("raw")
            });
            expect(args).toHaveLength(1);
            assert(args[0] != null, "expected constructor argument");
            expect(getTextOfTsNode(args[0])).toMatchSnapshot();
        });

        it("includes only statusCode (all others undefined)", () => {
            const impl = createImpl();
            const args = impl.buildConstructorArguments({
                message: undefined,
                statusCode: ts.factory.createNumericLiteral(503),
                responseBody: undefined,
                rawResponse: undefined
            });
            expect(args).toHaveLength(1);
            assert(args[0] != null, "expected constructor argument");
            expect(getTextOfTsNode(args[0])).toMatchSnapshot();
        });

        it("returns empty object when no properties provided", () => {
            const impl = createImpl();
            const args = impl.buildConstructorArguments({
                message: undefined,
                statusCode: undefined,
                responseBody: undefined,
                rawResponse: undefined
            });
            expect(args).toHaveLength(1);
            assert(args[0] != null, "expected constructor argument");
            expect(getTextOfTsNode(args[0])).toMatchSnapshot();
        });
    });
});

// ────────────────────────────────────────────────────────────────────────────
// TimeoutSdkErrorGenerator (factory)
// ────────────────────────────────────────────────────────────────────────────

describe("TimeoutSdkErrorGenerator", () => {
    it("creates a GeneratedTimeoutSdkError", () => {
        const generator = new TimeoutSdkErrorGenerator();
        const result = generator.generateTimeoutSdkError({ errorClassName: "TimeoutError" });
        expect(result).toBeDefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedTimeoutSdkErrorImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedTimeoutSdkErrorImpl", () => {
    function createImpl(name?: string) {
        return new GeneratedTimeoutSdkErrorImpl({ errorClassName: name ?? "TimeoutError" });
    }

    describe("writeToFile", () => {
        it("writes timeout error class", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            impl.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes timeout error class with custom name", () => {
            const impl = createImpl("CustomTimeoutError");
            const context = createMockSdkContext();
            impl.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });

    describe("build", () => {
        it("builds new expression with message", () => {
            const impl = createImpl();
            const context = createMockSdkContext();
            const result = impl.build(context, "Request timed out");
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });
    });

    describe("buildConstructorArguments", () => {
        it("wraps message in object literal", () => {
            const impl = createImpl();
            const args = impl.buildConstructorArguments(ts.factory.createStringLiteral("timeout"));
            expect(args).toHaveLength(1);
            assert(args[0] != null, "expected constructor argument");
            expect(getTextOfTsNode(args[0])).toMatchSnapshot();
        });
    });
});
