import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import {
    caseConverter,
    casingsGenerator,
    createHttpEndpoint,
    createMockReference,
    createMockZurgObjectSchema,
    createMockZurgSchema,
    createNameAndWireValue
} from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedSdkInlinedRequestBodySchemaImpl } from "../GeneratedSdkInlinedRequestBodySchemaImpl.js";
import { SdkInlinedRequestBodySchemaGenerator } from "../SdkInlinedRequestBodySchemaGenerator.js";

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
                object: () => createMockZurgObjectSchema("object({})"),
                objectWithoutOptionalProperties: () =>
                    createMockZurgObjectSchema("objectWithoutOptionalProperties({})"),
                Schema: {
                    _getReferenceToType: ({
                        rawShape,
                        parsedShape
                    }: {
                        rawShape: ts.TypeNode;
                        parsedShape: ts.TypeNode;
                    }) => ts.factory.createTypeReferenceNode("Schema", [rawShape, parsedShape]),
                    _fromExpression: (expr: ts.Expression) => createMockZurgSchema(getTextOfTsNode(expr))
                },
                ObjectSchema: {
                    _getReferenceToType: ({
                        rawShape,
                        parsedShape
                    }: {
                        rawShape: ts.TypeNode;
                        parsedShape: ts.TypeNode;
                    }) => ts.factory.createTypeReferenceNode("ObjectSchema", [rawShape, parsedShape])
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
            resolveTypeReference: (typeRef: FernIr.TypeReference) => {
                // Return non-literal for all types (not filtered out)
                return FernIr.ResolvedTypeReference.primitive({
                    v1: FernIr.PrimitiveTypeV1.String,
                    v2: undefined
                });
            }
        },
        sdkInlinedRequestBodySchema: {
            getReferenceToInlinedRequestBody: () => createMockReference("InlinedRequestSchema")
        },
        requestWrapper: {
            getReferenceToRequestWrapper: () => ts.factory.createTypeReferenceNode("RequestWrapper"),
            getGeneratedRequestWrapper: () => ({
                getNonBodyKeys: () => [],
                getInlinedRequestBodyPropertyKey: (prop: FernIr.InlinedRequestBodyProperty) => ({
                    propertyName: caseConverter.camelUnsafe(prop.name)
                })
            })
        },
        case: caseConverter
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

const TEST_PACKAGE_ID = "pkg_test" as unknown as PackageId;

function createInlinedRequestBody(opts?: {
    properties?: FernIr.InlinedRequestBodyProperty[];
    extends?: FernIr.DeclaredTypeName[];
    extraProperties?: boolean;
}): FernIr.InlinedRequestBody {
    return {
        name: casingsGenerator.generateName("CreateRequest"),
        extends: opts?.extends ?? [],
        properties: opts?.properties ?? [],
        extendedProperties: undefined,
        extraProperties: opts?.extraProperties ?? false,
        contentType: undefined,
        v2Examples: undefined,
        docs: undefined
    };
}

function createInlinedRequestProperty(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { wireValue?: string }
): FernIr.InlinedRequestBodyProperty {
    return {
        name: createNameAndWireValue(name, opts?.wireValue ?? name),
        valueType,
        docs: undefined,
        availability: undefined,
        v2Examples: undefined,
        propertyAccess: undefined
    };
}

function createDeclaredTypeName(name: string): FernIr.DeclaredTypeName {
    return {
        typeId: `type_${name}`,
        fernFilepath: { allParts: [], packagePath: [], file: undefined },
        name: casingsGenerator.generateName(name),
        displayName: undefined
    };
}

function createEndpointWithInlinedBody(inlinedRequestBody: FernIr.InlinedRequestBody): FernIr.HttpEndpoint {
    const base = createHttpEndpoint();
    return {
        ...base,
        requestBody: FernIr.HttpRequestBody.inlinedRequestBody(inlinedRequestBody)
    };
}

// ────────────────────────────────────────────────────────────────────────────
// SdkInlinedRequestBodySchemaGenerator (factory)
// ────────────────────────────────────────────────────────────────────────────

describe("SdkInlinedRequestBodySchemaGenerator", () => {
    it("creates schema for endpoint with inlined request body", () => {
        const generator = new SdkInlinedRequestBodySchemaGenerator({
            includeSerdeLayer: true,
            allowExtraFields: false,
            omitUndefined: false
        });
        const inlinedBody = createInlinedRequestBody({
            properties: [
                createInlinedRequestProperty("name", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
            ]
        });
        const endpoint = createEndpointWithInlinedBody(inlinedBody);
        const result = generator.generateInlinedRequestBodySchema({
            packageId: TEST_PACKAGE_ID,
            endpoint,
            typeName: "CreateRequest"
        });
        expect(result).toBeDefined();
    });

    it("throws for non-inlined request body", () => {
        const generator = new SdkInlinedRequestBodySchemaGenerator({
            includeSerdeLayer: true,
            allowExtraFields: false,
            omitUndefined: false
        });
        const endpoint = createHttpEndpoint();
        expect(() =>
            generator.generateInlinedRequestBodySchema({
                packageId: TEST_PACKAGE_ID,
                endpoint,
                typeName: "GetRequest"
            })
        ).toThrow("Request is not inlined");
    });

    it("passes includeSerdeLayer to impl", () => {
        const generator = new SdkInlinedRequestBodySchemaGenerator({
            includeSerdeLayer: false,
            allowExtraFields: false,
            omitUndefined: false
        });
        const inlinedBody = createInlinedRequestBody();
        const endpoint = createEndpointWithInlinedBody(inlinedBody);
        const result = generator.generateInlinedRequestBodySchema({
            packageId: TEST_PACKAGE_ID,
            endpoint,
            typeName: "CreateRequest"
        });
        expect(result).toBeDefined();
    });

    it("passes allowExtraFields and omitUndefined to impl", () => {
        const generator = new SdkInlinedRequestBodySchemaGenerator({
            includeSerdeLayer: true,
            allowExtraFields: true,
            omitUndefined: true
        });
        const inlinedBody = createInlinedRequestBody();
        const endpoint = createEndpointWithInlinedBody(inlinedBody);
        const result = generator.generateInlinedRequestBodySchema({
            packageId: TEST_PACKAGE_ID,
            endpoint,
            typeName: "CreateRequest"
        });
        expect(result).toBeDefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedSdkInlinedRequestBodySchemaImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedSdkInlinedRequestBodySchemaImpl", () => {
    function createInlinedSchema(opts: {
        typeName: string;
        inlinedRequestBody: FernIr.InlinedRequestBody;
        includeSerdeLayer?: boolean;
        allowExtraFields?: boolean;
        omitUndefined?: boolean;
    }) {
        const endpoint = createEndpointWithInlinedBody(opts.inlinedRequestBody);
        return new GeneratedSdkInlinedRequestBodySchemaImpl({
            typeName: opts.typeName,
            packageId: TEST_PACKAGE_ID,
            endpoint,
            inlinedRequestBody: opts.inlinedRequestBody,
            includeSerdeLayer: opts.includeSerdeLayer ?? true,
            allowExtraFields: opts.allowExtraFields ?? false,
            omitUndefined: opts.omitUndefined ?? false
        });
    }

    describe("writeToFile", () => {
        it("generates schema for empty inlined body", () => {
            const schema = createInlinedSchema({
                typeName: "EmptyRequest",
                inlinedRequestBody: createInlinedRequestBody()
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates schema for inlined body with properties", () => {
            const schema = createInlinedSchema({
                typeName: "CreateRequest",
                inlinedRequestBody: createInlinedRequestBody({
                    properties: [
                        createInlinedRequestProperty(
                            "name",
                            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        ),
                        createInlinedRequestProperty(
                            "age",
                            FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined })
                        )
                    ]
                })
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates schema for inlined body with extends", () => {
            const schema = createInlinedSchema({
                typeName: "ExtendedRequest",
                inlinedRequestBody: createInlinedRequestBody({
                    properties: [
                        createInlinedRequestProperty(
                            "value",
                            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        )
                    ],
                    extends: [createDeclaredTypeName("BaseRequest")]
                })
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates schema for inlined body with multiple extends", () => {
            const schema = createInlinedSchema({
                typeName: "MixedRequest",
                inlinedRequestBody: createInlinedRequestBody({
                    extends: [createDeclaredTypeName("AuthMixin"), createDeclaredTypeName("PaginationMixin")]
                })
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("generates raw type with optional properties", () => {
            const context = createMockFileContext();
            let callCount = 0;
            context.typeSchema.getReferenceToRawType = () => {
                callCount++;
                return {
                    typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    typeNodeWithoutUndefined: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                    isOptional: callCount % 2 === 0
                };
            };

            const schema = createInlinedSchema({
                typeName: "PartialRequest",
                inlinedRequestBody: createInlinedRequestBody({
                    properties: [
                        createInlinedRequestProperty(
                            "required",
                            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        ),
                        createInlinedRequestProperty(
                            "optional",
                            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        )
                    ]
                })
            });
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("filters out literal properties from schema", () => {
            const context = createMockFileContext();
            // Override resolveTypeReference to return literal for first property
            let callCount = 0;
            context.type.resolveTypeReference = () => {
                callCount++;
                if (callCount === 1 || callCount === 3) {
                    // First property is literal (called in both raw type and schema building)
                    return FernIr.ResolvedTypeReference.container(
                        FernIr.ContainerType.literal(FernIr.Literal.string("fixed-value"))
                    );
                }
                return FernIr.ResolvedTypeReference.primitive({
                    v1: FernIr.PrimitiveTypeV1.String,
                    v2: undefined
                });
            };

            const schema = createInlinedSchema({
                typeName: "LiteralFilteredRequest",
                inlinedRequestBody: createInlinedRequestBody({
                    properties: [
                        createInlinedRequestProperty(
                            "version",
                            FernIr.TypeReference.container(FernIr.ContainerType.literal(FernIr.Literal.string("v1")))
                        ),
                        createInlinedRequestProperty(
                            "name",
                            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        )
                    ]
                })
            });
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });

    describe("serializeRequest", () => {
        it("serializes with serde layer using jsonOrThrow", () => {
            const schema = createInlinedSchema({
                typeName: "SerializeRequest",
                inlinedRequestBody: createInlinedRequestBody({
                    properties: [
                        createInlinedRequestProperty(
                            "name",
                            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        )
                    ]
                }),
                includeSerdeLayer: true
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            const ref = ts.factory.createIdentifier("request");
            const result = schema.serializeRequest(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("returns passthrough when serde layer disabled", () => {
            const schema = createInlinedSchema({
                typeName: "NoSerdeRequest",
                inlinedRequestBody: createInlinedRequestBody(),
                includeSerdeLayer: false
            });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("request");
            const result = schema.serializeRequest(ref, context);
            // Without serde layer, returns the reference unchanged
            expect(getTextOfTsNode(result)).toBe("request");
        });
    });

    describe("getReferenceToParsedShape", () => {
        it("returns RequestWrapper type when no non-body keys", () => {
            const schema = createInlinedSchema({
                typeName: "SimpleRequest",
                inlinedRequestBody: createInlinedRequestBody()
            });
            const context = createMockFileContext();
            schema.writeToFile(context);
            // The parsed shape should reference the request wrapper
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("returns Omit type when there are non-body keys", () => {
            const context = createMockFileContext();
            context.requestWrapper.getGeneratedRequestWrapper = () => ({
                getNonBodyKeys: () => [{ propertyName: "queryParam" }, { propertyName: "headerParam" }],
                getInlinedRequestBodyPropertyKey: (prop: FernIr.InlinedRequestBodyProperty) => ({
                    propertyName: caseConverter.camelUnsafe(prop.name)
                })
            });

            const schema = createInlinedSchema({
                typeName: "OmitRequest",
                inlinedRequestBody: createInlinedRequestBody({
                    properties: [
                        createInlinedRequestProperty(
                            "name",
                            FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                        )
                    ]
                })
            });
            schema.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });
});
