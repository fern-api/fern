import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { casingsGenerator, createMockReference, createMockZurgSchema } from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedSdkErrorSchemaImpl } from "../GeneratedSdkErrorSchemaImpl.js";
import { SdkErrorSchemaGenerator } from "../SdkErrorSchemaGenerator.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function createMockFileContext() {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");
    return {
        sourceFile,
        coreUtilities: {
            zurg: {
                Schema: {
                    _getReferenceToType: ({
                        rawShape,
                        parsedShape
                    }: {
                        rawShape: ts.TypeNode;
                        parsedShape: ts.TypeNode;
                    }) => ts.factory.createTypeReferenceNode("Schema", [rawShape, parsedShape]),
                    _fromExpression: (expr: ts.Expression) => createMockZurgSchema(getTextOfTsNode(expr))
                }
            }
        },
        typeSchema: {
            getSchemaOfTypeReference: () => createMockZurgSchema("typeRefSchema"),
            getSchemaOfNamedType: () => createMockZurgSchema("namedTypeSchema"),
            getReferenceToRawType: () => ({
                typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                typeNodeWithoutUndefined: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                isOptional: false
            }),
            getReferenceToRawNamedType: () => createMockReference("RawNamedType")
        },
        type: {
            getReferenceToType: () => ({
                typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            }),
            getTypeDeclaration: () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            })
        },
        sdkErrorSchema: {
            getReferenceToSdkErrorSchema: () => createMockReference("ErrorSchema")
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createErrorDeclaration(opts?: { type?: FernIr.TypeReference }): FernIr.ErrorDeclaration {
    return {
        name: {
            errorId: "error_BadRequest",
            fernFilepath: { allParts: [], packagePath: [], file: undefined },
            name: casingsGenerator.generateName("BadRequest")
        },
        discriminantValue: createNameAndWireValue("BadRequest", "BadRequest"),
        type: opts?.type,
        statusCode: 400,
        docs: undefined,
        examples: [],
        v2Examples: undefined,
        displayName: undefined,
        isWildcardStatusCode: false,
        headers: []
    };
}

function createNameAndWireValue(name: string, wireValue: string): FernIr.NameAndWireValue {
    return {
        wireValue,
        name: casingsGenerator.generateName(name)
    };
}

// ────────────────────────────────────────────────────────────────────────────
// SdkErrorSchemaGenerator (factory)
// ────────────────────────────────────────────────────────────────────────────

describe("SdkErrorSchemaGenerator", () => {
    it("returns undefined for error declaration with no type", () => {
        const generator = new SdkErrorSchemaGenerator({
            skipValidation: false,
            includeSerdeLayer: true
        });
        const result = generator.generateSdkErrorSchema({
            errorName: "NoBodyError",
            errorDeclaration: createErrorDeclaration({ type: undefined })
        });
        expect(result).toBeUndefined();
    });

    it("returns GeneratedSdkErrorSchemaImpl for error with primitive type", () => {
        const generator = new SdkErrorSchemaGenerator({
            skipValidation: false,
            includeSerdeLayer: true
        });
        const result = generator.generateSdkErrorSchema({
            errorName: "BadRequestError",
            errorDeclaration: createErrorDeclaration({
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            })
        });
        expect(result).toBeDefined();
    });

    it("returns schema for error with named type", () => {
        const generator = new SdkErrorSchemaGenerator({
            skipValidation: false,
            includeSerdeLayer: true
        });
        const result = generator.generateSdkErrorSchema({
            errorName: "ValidationError",
            errorDeclaration: createErrorDeclaration({
                type: FernIr.TypeReference.named({
                    typeId: "type_ValidationResult",
                    fernFilepath: { allParts: [], packagePath: [], file: undefined },
                    name: casingsGenerator.generateName("ValidationResult"),
                    displayName: undefined,
                    default: undefined,
                    inline: undefined
                })
            })
        });
        expect(result).toBeDefined();
    });

    it("returns schema for error with container type", () => {
        const generator = new SdkErrorSchemaGenerator({
            skipValidation: false,
            includeSerdeLayer: true
        });
        const result = generator.generateSdkErrorSchema({
            errorName: "BatchError",
            errorDeclaration: createErrorDeclaration({
                type: FernIr.TypeReference.container(
                    FernIr.ContainerType.list(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                )
            })
        });
        expect(result).toBeDefined();
    });

    it("passes skipValidation=true to schema impl", () => {
        const generator = new SdkErrorSchemaGenerator({
            skipValidation: true,
            includeSerdeLayer: true
        });
        const result = generator.generateSdkErrorSchema({
            errorName: "SkippedError",
            errorDeclaration: createErrorDeclaration({
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            })
        });
        expect(result).toBeDefined();
    });

    it("passes includeSerdeLayer=false to schema impl", () => {
        const generator = new SdkErrorSchemaGenerator({
            skipValidation: false,
            includeSerdeLayer: false
        });
        const result = generator.generateSdkErrorSchema({
            errorName: "NoSerdeError",
            errorDeclaration: createErrorDeclaration({
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            })
        });
        expect(result).toBeDefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedSdkErrorSchemaImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedSdkErrorSchemaImpl", () => {
    function createErrorSchema(opts: {
        errorName: string;
        type: FernIr.TypeReference;
        skipValidation?: boolean;
        includeSerdeLayer?: boolean;
    }) {
        return new GeneratedSdkErrorSchemaImpl({
            errorName: opts.errorName,
            errorDeclaration: createErrorDeclaration({ type: opts.type }),
            type: opts.type,
            skipValidation: opts.skipValidation ?? false,
            includeSerdeLayer: opts.includeSerdeLayer ?? true
        });
    }

    describe("writeToFile", () => {
        it("writes schema for primitive error type", () => {
            const schema = createErrorSchema({
                errorName: "BadRequestError",
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes schema for container error type", () => {
            const schema = createErrorSchema({
                errorName: "BatchError",
                type: FernIr.TypeReference.container(
                    FernIr.ContainerType.list(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                )
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("does not write schema for named error type (no-op)", () => {
            const schema = createErrorSchema({
                errorName: "NamedError",
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
            schema.writeToFile(context);
            // Named types don't generate schema — consumers serialize the named type directly
            expect(context.sourceFile.getFullText()).toBe("");
        });

        it("does not write schema for unknown error type (no-op)", () => {
            const schema = createErrorSchema({
                errorName: "UnknownError",
                type: FernIr.TypeReference.unknown()
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toBe("");
        });
    });

    describe("deserializeBody", () => {
        it("deserializes named error body with serde layer", () => {
            const schema = createErrorSchema({
                errorName: "NamedError",
                type: FernIr.TypeReference.named({
                    typeId: "type_ErrorBody",
                    fernFilepath: { allParts: [], packagePath: [], file: undefined },
                    name: casingsGenerator.generateName("ErrorBody"),
                    displayName: undefined,
                    default: undefined,
                    inline: undefined
                }),
                includeSerdeLayer: true
            });
            const context = createMockFileContext();
            const body = ts.factory.createIdentifier("rawBody");
            const result = schema.deserializeBody(context, { referenceToBody: body });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("deserializes unknown error body (passthrough)", () => {
            const schema = createErrorSchema({
                errorName: "UnknownError",
                type: FernIr.TypeReference.unknown(),
                includeSerdeLayer: true
            });
            const context = createMockFileContext();
            const body = ts.factory.createIdentifier("rawBody");
            const result = schema.deserializeBody(context, { referenceToBody: body });
            // Unknown types just return the body as-is
            expect(getTextOfTsNode(result)).toBe("rawBody");
        });

        it("deserializes primitive error body with serde layer", () => {
            const schema = createErrorSchema({
                errorName: "PrimitiveError",
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                includeSerdeLayer: true
            });
            const context = createMockFileContext();
            schema.writeToFile(context); // Need to write schema first to have reference
            const body = ts.factory.createIdentifier("rawBody");
            const result = schema.deserializeBody(context, { referenceToBody: body });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("deserializes container error body with serde layer", () => {
            const schema = createErrorSchema({
                errorName: "ContainerError",
                type: FernIr.TypeReference.container(
                    FernIr.ContainerType.list(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                ),
                includeSerdeLayer: true
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            const body = ts.factory.createIdentifier("rawBody");
            const result = schema.deserializeBody(context, { referenceToBody: body });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("casts to type when serde layer is disabled", () => {
            const schema = createErrorSchema({
                errorName: "NoSerdeError",
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                includeSerdeLayer: false
            });
            const context = createMockFileContext();
            const body = ts.factory.createIdentifier("rawBody");
            const result = schema.deserializeBody(context, { referenceToBody: body });
            // Without serde layer, casts with `as` expression
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("casts named type when serde layer is disabled", () => {
            const schema = createErrorSchema({
                errorName: "NoSerdeNamedError",
                type: FernIr.TypeReference.named({
                    typeId: "type_ErrorBody",
                    fernFilepath: { allParts: [], packagePath: [], file: undefined },
                    name: casingsGenerator.generateName("ErrorBody"),
                    displayName: undefined,
                    default: undefined,
                    inline: undefined
                }),
                includeSerdeLayer: false
            });
            const context = createMockFileContext();
            const body = ts.factory.createIdentifier("rawBody");
            const result = schema.deserializeBody(context, { referenceToBody: body });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });
    });
});
