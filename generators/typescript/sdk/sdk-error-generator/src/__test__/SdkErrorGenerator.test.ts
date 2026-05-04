import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
    casingsGenerator,
    createMockReference,
    createNameAndWireValue
} from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedSdkErrorClassImpl } from "../GeneratedSdkErrorClassImpl.js";
import { SdkErrorGenerator } from "../SdkErrorGenerator.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function createMockFileContext() {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");
    return {
        sourceFile,
        type: {
            getReferenceToType: () => ({
                typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                typeNodeWithoutUndefined: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                isOptional: false
            })
        },
        coreUtilities: {
            fetcher: {
                RawResponse: {
                    RawResponse: {
                        _getReferenceToType: () => ts.factory.createTypeReferenceNode("RawResponse")
                    }
                }
            }
        },
        sdkError: {
            getReferenceToError: () => createMockReference("BadRequestError")
        },
        genericAPISdkError: {
            getReferenceToGenericAPISdkError: () => createMockReference("ApiError"),
            getGeneratedGenericAPISdkError: () => ({
                buildConstructorArguments: ({
                    message,
                    statusCode,
                    responseBody,
                    rawResponse
                }: {
                    message: ts.Expression | undefined;
                    statusCode: ts.Expression | undefined;
                    responseBody: ts.Expression | undefined;
                    rawResponse: ts.Expression | undefined;
                }) => {
                    const props: ts.ObjectLiteralElementLike[] = [];
                    if (message != null) {
                        props.push(ts.factory.createPropertyAssignment("message", message));
                    }
                    if (statusCode != null) {
                        props.push(ts.factory.createPropertyAssignment("statusCode", statusCode));
                    }
                    if (responseBody != null) {
                        props.push(ts.factory.createPropertyAssignment("body", responseBody));
                    }
                    if (rawResponse != null) {
                        props.push(ts.factory.createPropertyAssignment("rawResponse", rawResponse));
                    }
                    return [ts.factory.createObjectLiteralExpression(props, true)];
                }
            })
        },
        case: caseConverter
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createErrorDeclaration(opts?: {
    type?: FernIr.TypeReference;
    statusCode?: number;
    name?: string;
}): FernIr.ErrorDeclaration {
    const errorName = opts?.name ?? "BadRequest";
    return {
        name: {
            errorId: `error_${errorName}`,
            fernFilepath: { allParts: [], packagePath: [], file: undefined },
            name: casingsGenerator.generateName(errorName)
        },
        discriminantValue: createNameAndWireValue(errorName, errorName),
        type: opts?.type,
        statusCode: opts?.statusCode ?? 400,
        docs: undefined,
        examples: [],
        v2Examples: undefined,
        displayName: undefined,
        isWildcardStatusCode: false,
        headers: []
    };
}

// ────────────────────────────────────────────────────────────────────────────
// SdkErrorGenerator (factory)
// ────────────────────────────────────────────────────────────────────────────

describe("SdkErrorGenerator", () => {
    it("returns undefined when neverThrowErrors is true", () => {
        const generator = new SdkErrorGenerator({ neverThrowErrors: true });
        const result = generator.generateError({
            errorName: "BadRequestError",
            errorDeclaration: createErrorDeclaration()
        });
        expect(result).toBeUndefined();
    });

    it("returns GeneratedSdkErrorClassImpl when neverThrowErrors is false", () => {
        const generator = new SdkErrorGenerator({ neverThrowErrors: false });
        const result = generator.generateError({
            errorName: "BadRequestError",
            errorDeclaration: createErrorDeclaration()
        });
        expect(result).toBeDefined();
    });

    it("returns undefined for error with body type when neverThrowErrors is true", () => {
        const generator = new SdkErrorGenerator({ neverThrowErrors: true });
        const result = generator.generateError({
            errorName: "BadRequestError",
            errorDeclaration: createErrorDeclaration({
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            })
        });
        expect(result).toBeUndefined();
    });

    it("returns error class for error with body type when neverThrowErrors is false", () => {
        const generator = new SdkErrorGenerator({ neverThrowErrors: false });
        const result = generator.generateError({
            errorName: "BadRequestError",
            errorDeclaration: createErrorDeclaration({
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            })
        });
        expect(result).toBeDefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedSdkErrorClassImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedSdkErrorClassImpl", () => {
    function createErrorClass(opts?: { type?: FernIr.TypeReference; statusCode?: number; name?: string }) {
        const errorDeclaration = createErrorDeclaration(opts);
        return new GeneratedSdkErrorClassImpl({
            errorClassName: `${opts?.name ?? "BadRequest"}Error`,
            errorDeclaration
        });
    }

    describe("writeToFile", () => {
        it("writes error class without body type", () => {
            const errorClass = createErrorClass();
            const context = createMockFileContext();
            errorClass.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes error class with body type", () => {
            const errorClass = createErrorClass({
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });
            const context = createMockFileContext();
            errorClass.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes error class with named body type", () => {
            const errorClass = createErrorClass({
                type: FernIr.TypeReference.named({
                    typeId: "type_ErrorBody",
                    fernFilepath: { allParts: [], packagePath: [], file: undefined },
                    name: casingsGenerator.generateName("ErrorBody"),
                    displayName: undefined,
                    default: undefined,
                    inline: undefined
                })
            });
            const context = createMockFileContext();
            errorClass.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes error class with optional body type", () => {
            const errorClass = createErrorClass({
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });
            const optionalContext = createMockFileContext();
            // Override to return optional type
            optionalContext.type.getReferenceToType = () => ({
                typeNode: ts.factory.createUnionTypeNode([
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                ]),
                typeNodeWithoutUndefined: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                isOptional: true
            });
            errorClass.writeToFile(optionalContext);
            expect(optionalContext.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes error class with custom status code", () => {
            const errorClass = createErrorClass({
                statusCode: 404,
                name: "NotFound"
            });
            const context = createMockFileContext();
            errorClass.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });

    describe("build", () => {
        it("builds new expression without body", () => {
            const errorClass = createErrorClass();
            const context = createMockFileContext();
            const result = errorClass.build(context, {
                referenceToBody: undefined,
                referenceToRawResponse: undefined
            });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds new expression with body", () => {
            const errorClass = createErrorClass({
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });
            const context = createMockFileContext();
            const result = errorClass.build(context, {
                referenceToBody: ts.factory.createIdentifier("parsedBody"),
                referenceToRawResponse: undefined
            });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds new expression with body and rawResponse", () => {
            const errorClass = createErrorClass({
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });
            const context = createMockFileContext();
            const result = errorClass.build(context, {
                referenceToBody: ts.factory.createIdentifier("parsedBody"),
                referenceToRawResponse: ts.factory.createIdentifier("rawResp")
            });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("builds new expression with only rawResponse (no body)", () => {
            const errorClass = createErrorClass();
            const context = createMockFileContext();
            const result = errorClass.build(context, {
                referenceToBody: undefined,
                referenceToRawResponse: ts.factory.createIdentifier("rawResp")
            });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });
    });

    describe("type property", () => {
        it("has type === 'class'", () => {
            const errorClass = createErrorClass();
            expect(errorClass.type).toBe("class");
        });
    });
});
