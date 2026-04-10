import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import { FileContext } from "@fern-typescript/contexts";
import {
    caseConverter,
    casingsGenerator,
    createDeclaredTypeName,
    createNameAndWireValue
} from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedRequestWrapperExampleImpl } from "../GeneratedRequestWrapperExampleImpl.js";

// ── Helpers ────────────────────────────────────────────────────────────

const PACKAGE_ID = { isRoot: true } as PackageId;
const ENDPOINT_NAME = casingsGenerator.generateName("testEndpoint");
const DEFAULT_OPTS = { isForComment: false, isForRequest: false };

function createExampleEndpointCall(overrides?: Partial<FernIr.ExampleEndpointCall>): FernIr.ExampleEndpointCall {
    return {
        id: "example1",
        name: casingsGenerator.generateName("example"),
        url: "/test",
        rootPathParameters: [],
        servicePathParameters: [],
        endpointPathParameters: [],
        serviceHeaders: [],
        endpointHeaders: [],
        queryParameters: [],
        request: undefined,
        response: FernIr.ExampleResponse.ok(FernIr.ExampleEndpointSuccessResponse.body(undefined)),
        docs: undefined,
        ...overrides
    };
}

function createExampleTypeReference(
    shape: FernIr.ExampleTypeReferenceShape,
    jsonExample: unknown = "test"
): FernIr.ExampleTypeReference {
    return { shape, jsonExample };
}

function stringPrimitive(value: string): FernIr.ExampleTypeReferenceShape {
    return FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.string({ original: value }));
}

function integerPrimitive(value: number): FernIr.ExampleTypeReferenceShape {
    return FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.integer(value));
}

function literalShape(value: string): FernIr.ExampleTypeReferenceShape {
    return FernIr.ExampleTypeReferenceShape.container(
        FernIr.ExampleContainer.literal({ literal: FernIr.ExamplePrimitive.string({ original: value }) })
    );
}

/**
 * Creates a mock FileContext for GeneratedRequestWrapperExampleImpl.build().
 * Covers all context.* accesses in the source:
 * - context.requestWrapper.getGeneratedRequestWrapper
 * - context.inlineFileProperties
 * - context.externalDependencies.fs.createReadStream
 * - context.type.getGeneratedExample
 * - context.type.getGeneratedType
 * - context.logger.debug
 */
function createMockContext(opts?: {
    inlineFileProperties?: boolean;
    shouldInlinePathParameters?: boolean;
    generatedTypeOverride?: (decl: FernIr.DeclaredTypeName) => {
        type: string;
        getSinglePropertyKey?: (prop: FernIr.SingleUnionTypeProperty) => string;
        getPropertyKey?: (args: { propertyWireKey: string }) => string;
    };
    getPropertyKeyError?: boolean;
}): FileContext {
    const mockGeneratedRequestWrapper = {
        getPropertyNameOfFileParameter: (fileProperty: FernIr.FileProperty) => ({
            propertyName: caseConverter.camelUnsafe(fileProperty.key)
        }),
        getPropertyNameOfNonLiteralHeaderFromName: (name: FernIr.NameAndWireValueOrString) => ({
            propertyName: caseConverter.camelUnsafe(name)
        }),
        shouldInlinePathParameters: () => opts?.shouldInlinePathParameters ?? false,
        getPropertyNameOfPathParameterFromName: (name: FernIr.NameOrString) => ({
            propertyName: caseConverter.camelUnsafe(name)
        }),
        getPropertyNameOfQueryParameterFromName: (name: FernIr.NameAndWireValueOrString) => ({
            propertyName: caseConverter.camelUnsafe(name)
        }),
        getInlinedRequestBodyPropertyKeyFromName: (name: FernIr.NameAndWireValueOrString) => ({
            propertyName: caseConverter.camelUnsafe(name)
        })
    };

    return {
        requestWrapper: {
            getGeneratedRequestWrapper: () => mockGeneratedRequestWrapper
        },
        inlineFileProperties: opts?.inlineFileProperties ?? false,
        externalDependencies: {
            fs: {
                createReadStream: (pathExpr: ts.Expression) =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("fs"),
                            ts.factory.createIdentifier("createReadStream")
                        ),
                        undefined,
                        [pathExpr]
                    )
            }
        },
        type: {
            getGeneratedExample: (exampleTypeRef: FernIr.ExampleTypeReference) => ({
                build: () => {
                    // For literal containers, return undefined to test filtering
                    if (
                        exampleTypeRef.shape.type === "container" &&
                        exampleTypeRef.shape.container.type === "literal"
                    ) {
                        return ts.factory.createIdentifier("undefined");
                    }
                    // For primitives, return based on the primitive type
                    if (exampleTypeRef.shape.type === "primitive") {
                        const primType = exampleTypeRef.shape.primitive.type;
                        if (
                            primType === "integer" ||
                            primType === "long" ||
                            primType === "uint" ||
                            primType === "uint64" ||
                            primType === "float" ||
                            primType === "double"
                        ) {
                            return ts.factory.createNumericLiteral(Number(exampleTypeRef.jsonExample));
                        }
                        if (primType === "boolean") {
                            return exampleTypeRef.jsonExample ? ts.factory.createTrue() : ts.factory.createFalse();
                        }
                        return ts.factory.createStringLiteral(String(exampleTypeRef.jsonExample));
                    }
                    // For named types, return a simple object
                    if (exampleTypeRef.shape.type === "named") {
                        return ts.factory.createObjectLiteralExpression(
                            [
                                ts.factory.createPropertyAssignment(
                                    "value",
                                    ts.factory.createStringLiteral("named-value")
                                )
                            ],
                            true
                        );
                    }
                    // Default: return a string literal of the json example
                    return ts.factory.createStringLiteral(String(exampleTypeRef.jsonExample));
                }
            }),
            getGeneratedType: (decl: FernIr.DeclaredTypeName) => {
                if (opts?.generatedTypeOverride) {
                    return opts.generatedTypeOverride(decl);
                }
                return {
                    type: "object",
                    getPropertyKey: (args: { propertyWireKey: string }) => {
                        if (opts?.getPropertyKeyError) {
                            throw new Error(`Property not found: ${args.propertyWireKey}`);
                        }
                        return args.propertyWireKey;
                    }
                };
            }
        },
        logger: {
            debug: () => {
                // noop for tests
            }
        },
        case: caseConverter
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal FileContext interface
    } as any;
}

function createImpl(overrides?: Partial<GeneratedRequestWrapperExampleImpl.Init>): GeneratedRequestWrapperExampleImpl {
    return new GeneratedRequestWrapperExampleImpl({
        bodyPropertyName: "body",
        example: createExampleEndpointCall(),
        packageId: PACKAGE_ID,
        endpointName: ENDPOINT_NAME,
        requestBody: undefined,
        flattenRequestParameters: false,
        ...overrides
    });
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("GeneratedRequestWrapperExampleImpl", () => {
    describe("build - empty request (no body, no headers, no query, no path params)", () => {
        it("returns an empty object literal", () => {
            const impl = createImpl();
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);

            const text = getTextOfTsNode(result);
            expect(text).toBe("{}");
        });
    });

    describe("build - query parameters", () => {
        it("generates property assignments for query parameters", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    queryParameters: [
                        {
                            name: createNameAndWireValue("limit", "limit"),
                            value: createExampleTypeReference(integerPrimitive(10), 10),
                            shape: undefined
                        },
                        {
                            name: createNameAndWireValue("offset", "offset"),
                            value: createExampleTypeReference(stringPrimitive("abc"), "abc"),
                            shape: undefined
                        }
                    ]
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("limit");
            expect(text).toContain("10");
            expect(text).toContain("offset");
            expect(text).toContain('"abc"');
        });
    });

    describe("build - headers", () => {
        it("generates property assignments for service headers", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    serviceHeaders: [
                        {
                            name: createNameAndWireValue("xApiKey", "X-Api-Key"),
                            value: createExampleTypeReference(stringPrimitive("key-123"), "key-123")
                        }
                    ]
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("xApiKey");
            expect(text).toContain('"key-123"');
        });

        it("generates property assignments for endpoint headers", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    endpointHeaders: [
                        {
                            name: createNameAndWireValue("contentType", "Content-Type"),
                            value: createExampleTypeReference(stringPrimitive("application/json"), "application/json")
                        }
                    ]
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("contentType");
            expect(text).toContain('"application/json"');
        });

        it("combines service and endpoint headers", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    serviceHeaders: [
                        {
                            name: createNameAndWireValue("svcHeader", "X-Svc"),
                            value: createExampleTypeReference(stringPrimitive("svc-val"), "svc-val")
                        }
                    ],
                    endpointHeaders: [
                        {
                            name: createNameAndWireValue("epHeader", "X-Ep"),
                            value: createExampleTypeReference(stringPrimitive("ep-val"), "ep-val")
                        }
                    ]
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("svcHeader");
            expect(text).toContain("epHeader");
        });

        it("filters out literal headers", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    serviceHeaders: [
                        {
                            name: createNameAndWireValue("literalHeader", "X-Literal"),
                            value: createExampleTypeReference(literalShape("fixed-value"), "fixed-value")
                        },
                        {
                            name: createNameAndWireValue("normalHeader", "X-Normal"),
                            value: createExampleTypeReference(stringPrimitive("dynamic"), "dynamic")
                        }
                    ]
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // literal header should be filtered out
            expect(text).not.toContain("literalHeader");
            expect(text).toContain("normalHeader");
        });
    });

    describe("build - path parameters", () => {
        it("returns empty when shouldInlinePathParameters is false", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    servicePathParameters: [
                        {
                            name: casingsGenerator.generateName("userId"),
                            value: createExampleTypeReference(stringPrimitive("user-123"), "user-123")
                        }
                    ]
                })
            });
            const context = createMockContext({ shouldInlinePathParameters: false });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // Path params should not appear when not inlined
            expect(text).toBe("{}");
        });

        it("generates property assignments when shouldInlinePathParameters is true", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    servicePathParameters: [
                        {
                            name: casingsGenerator.generateName("userId"),
                            value: createExampleTypeReference(stringPrimitive("user-123"), "user-123")
                        }
                    ],
                    endpointPathParameters: [
                        {
                            name: casingsGenerator.generateName("postId"),
                            value: createExampleTypeReference(stringPrimitive("post-456"), "post-456")
                        }
                    ]
                })
            });
            const context = createMockContext({ shouldInlinePathParameters: true });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("userId");
            expect(text).toContain('"user-123"');
            expect(text).toContain("postId");
            expect(text).toContain('"post-456"');
        });
    });

    describe("build - file properties", () => {
        it("returns empty when inlineFileProperties is false", () => {
            const fileUploadBody = FernIr.HttpRequestBody.fileUpload({
                name: casingsGenerator.generateName("UploadRequest"),
                properties: [
                    FernIr.FileUploadRequestProperty.file(
                        FernIr.FileProperty.file({
                            key: createNameAndWireValue("document", "document"),
                            isOptional: false,
                            contentType: undefined,
                            docs: undefined
                        })
                    )
                ],
                v2Examples: undefined,
                contentType: undefined,
                docs: undefined
            });

            const impl = createImpl({
                requestBody: fileUploadBody
            });
            const context = createMockContext({ inlineFileProperties: false });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toBe("{}");
        });

        it("generates createReadStream for required file property", () => {
            const fileUploadBody = FernIr.HttpRequestBody.fileUpload({
                name: casingsGenerator.generateName("UploadRequest"),
                properties: [
                    FernIr.FileUploadRequestProperty.file(
                        FernIr.FileProperty.file({
                            key: createNameAndWireValue("document", "document"),
                            isOptional: false,
                            contentType: undefined,
                            docs: undefined
                        })
                    )
                ],
                v2Examples: undefined,
                contentType: undefined,
                docs: undefined
            });

            const impl = createImpl({
                requestBody: fileUploadBody
            });
            const context = createMockContext({ inlineFileProperties: true });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("document");
            expect(text).toContain("fs.createReadStream");
            expect(text).toContain("/path/to/your/file");
        });

        it("generates array literal for fileArray property", () => {
            const fileUploadBody = FernIr.HttpRequestBody.fileUpload({
                name: casingsGenerator.generateName("UploadRequest"),
                properties: [
                    FernIr.FileUploadRequestProperty.file(
                        FernIr.FileProperty.fileArray({
                            key: createNameAndWireValue("documents", "documents"),
                            isOptional: false,
                            contentType: undefined,
                            docs: undefined
                        })
                    )
                ],
                v2Examples: undefined,
                contentType: undefined,
                docs: undefined
            });

            const impl = createImpl({
                requestBody: fileUploadBody
            });
            const context = createMockContext({ inlineFileProperties: true });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("documents");
            expect(text).toContain("[");
            expect(text).toContain("fs.createReadStream");
        });

        it("skips optional file properties", () => {
            const fileUploadBody = FernIr.HttpRequestBody.fileUpload({
                name: casingsGenerator.generateName("UploadRequest"),
                properties: [
                    FernIr.FileUploadRequestProperty.file(
                        FernIr.FileProperty.file({
                            key: createNameAndWireValue("optionalFile", "optional_file"),
                            isOptional: true,
                            contentType: undefined,
                            docs: undefined
                        })
                    )
                ],
                v2Examples: undefined,
                contentType: undefined,
                docs: undefined
            });

            const impl = createImpl({
                requestBody: fileUploadBody
            });
            const context = createMockContext({ inlineFileProperties: true });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // Optional files should be skipped
            expect(text).not.toContain("optionalFile");
        });

        it("skips bodyProperty items in fileUpload (only processes file types)", () => {
            const fileUploadBody = FernIr.HttpRequestBody.fileUpload({
                name: casingsGenerator.generateName("UploadRequest"),
                properties: [
                    FernIr.FileUploadRequestProperty.file(
                        FernIr.FileProperty.file({
                            key: createNameAndWireValue("myFile", "my_file"),
                            isOptional: false,
                            contentType: undefined,
                            docs: undefined
                        })
                    ),
                    FernIr.FileUploadRequestProperty.bodyProperty({
                        name: createNameAndWireValue("description", "description"),
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined,
                        availability: undefined,
                        v2Examples: undefined,
                        propertyAccess: undefined,
                        contentType: undefined,
                        style: undefined
                    })
                ],
                v2Examples: undefined,
                contentType: undefined,
                docs: undefined
            });

            const impl = createImpl({
                requestBody: fileUploadBody
            });
            const context = createMockContext({ inlineFileProperties: true });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // Only the file property should appear, not the body property
            expect(text).toContain("myFile");
            expect(text).toContain("fs.createReadStream");
        });
    });

    describe("build - no request body", () => {
        it("returns empty properties when example.request is undefined", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({ request: undefined })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toBe("{}");
        });
    });

    describe("build - inlined request body", () => {
        it("generates properties for inlined request body without originalTypeDeclaration", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("firstName", "first_name"),
                                value: createExampleTypeReference(stringPrimitive("John"), "John"),
                                originalTypeDeclaration: undefined
                            },
                            {
                                name: createNameAndWireValue("age", "age"),
                                value: createExampleTypeReference(integerPrimitive(30), 30),
                                originalTypeDeclaration: undefined
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("firstName");
            expect(text).toContain('"John"');
            expect(text).toContain("age");
            expect(text).toContain("30");
        });

        it("filters out properties with literal values from inlined body", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("type", "type"),
                                value: createExampleTypeReference(literalShape("fixed"), "fixed"),
                                originalTypeDeclaration: undefined
                            },
                            {
                                name: createNameAndWireValue("name", "name"),
                                value: createExampleTypeReference(stringPrimitive("Bob"), "Bob"),
                                originalTypeDeclaration: undefined
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // The literal "type" property should be filtered out by isNotLiteral
            expect(text).not.toContain('"type"');
            expect(text).toContain("name");
        });

        it("uses originalTypeDeclaration object type to get property key", () => {
            const declaredType = createDeclaredTypeName("MyObject");
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("myProp", "my_prop"),
                                value: createExampleTypeReference(stringPrimitive("val"), "val"),
                                originalTypeDeclaration: declaredType
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });
            const context = createMockContext({
                generatedTypeOverride: () => ({
                    type: "object",
                    getPropertyKey: (args: { propertyWireKey: string }) => `resolved_${args.propertyWireKey}`
                })
            });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("resolved_my_prop");
        });

        it("uses originalTypeDeclaration union type to get single property key", () => {
            const declaredType = createDeclaredTypeName("MyUnion");
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("unionProp", "union_prop"),
                                value: createExampleTypeReference(stringPrimitive("union-val"), "union-val"),
                                originalTypeDeclaration: declaredType
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });
            const context = createMockContext({
                generatedTypeOverride: () => ({
                    type: "union",
                    getSinglePropertyKey: () => "unionKey"
                })
            });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("unionKey");
        });

        it("filters out undefined values from union type properties", () => {
            const declaredType = createDeclaredTypeName("MyUnion");
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("unionProp", "union_prop"),
                                value: createExampleTypeReference(literalShape("literal-val"), "literal-val"),
                                originalTypeDeclaration: declaredType
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });
            // Note: the literal value won't get here because isNotLiteral filters it.
            // But if we test with a non-literal that returns undefined from the mock...
            const context = createMockContext({
                generatedTypeOverride: () => ({
                    type: "union",
                    getSinglePropertyKey: () => "unionKey"
                })
            });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // The literal property is filtered by isNotLiteral, so unionKey shouldn't appear
            expect(text).not.toContain("unionKey");
        });

        it("handles getPropertyKey error by logging debug and returning undefined", () => {
            const declaredType = createDeclaredTypeName("MyObject");
            let debugCalled = false;
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("failProp", "fail_prop"),
                                value: createExampleTypeReference(stringPrimitive("val"), "val"),
                                originalTypeDeclaration: declaredType
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });
            const context = createMockContext({ getPropertyKeyError: true });
            // Override logger to track calls
            // biome-ignore lint/suspicious/noExplicitAny: test mock override
            (context as any).logger = {
                debug: () => {
                    debugCalled = true;
                }
            };
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(debugCalled).toBe(true);
            // The property should be filtered out (returned undefined from catch)
            expect(text).not.toContain("failProp");
        });

        it("throws for non-object, non-union originalTypeDeclaration", () => {
            const declaredType = createDeclaredTypeName("MyEnum");
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("enumProp", "enum_prop"),
                                value: createExampleTypeReference(stringPrimitive("val"), "val"),
                                originalTypeDeclaration: declaredType
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });
            const context = createMockContext({
                generatedTypeOverride: () => ({ type: "enum" })
            });

            expect(() => impl.build(context, DEFAULT_OPTS)).toThrow(
                "Property does not come from an object, instead got enum"
            );
        });

        it("filters out undefined expression values from inlined body properties", () => {
            const declaredType = createDeclaredTypeName("MyObject");
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("normalProp", "normal_prop"),
                                value: createExampleTypeReference(stringPrimitive("present"), "present"),
                                originalTypeDeclaration: declaredType
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });

            // Create a context where getGeneratedExample returns `undefined` expression
            const context = createMockContext();
            // biome-ignore lint/suspicious/noExplicitAny: override to return undefined expression
            (context as any).type.getGeneratedExample = () => ({
                build: () => ts.factory.createIdentifier("undefined")
            });
            // biome-ignore lint/suspicious/noExplicitAny: override to return object type
            (context as any).type.getGeneratedType = () => ({
                type: "object",
                getPropertyKey: (args: { propertyWireKey: string }) => args.propertyWireKey
            });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // undefined values should be filtered out
            expect(text).toBe("{}");
        });
    });

    describe("build - inlined request body with extra properties", () => {
        it("includes extra properties in output", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [],
                        jsonExample: undefined,
                        extraProperties: [
                            {
                                name: createNameAndWireValue("customField", "custom_field"),
                                value: createExampleTypeReference(stringPrimitive("extra-val"), "extra-val")
                            }
                        ]
                    })
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("custom_field");
            expect(text).toContain('"extra-val"');
        });

        it("filters out undefined extra properties", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [],
                        jsonExample: undefined,
                        extraProperties: [
                            {
                                name: createNameAndWireValue("extraLiteral", "extra_literal"),
                                value: createExampleTypeReference(literalShape("lit"), "lit")
                            }
                        ]
                    })
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // The extra property value is "undefined" from mock, should be filtered out
            expect(text).toBe("{}");
        });
    });

    describe("build - reference request body", () => {
        it("wraps referenced body with bodyPropertyName", () => {
            const impl = createImpl({
                bodyPropertyName: "body",
                flattenRequestParameters: false,
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.reference(
                        createExampleTypeReference(stringPrimitive("hello"), "hello")
                    )
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("body");
            expect(text).toContain('"hello"');
        });

        it("flattens object literal when flattenRequestParameters is true", () => {
            const impl = createImpl({
                bodyPropertyName: "body",
                flattenRequestParameters: true,
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.reference(
                        createExampleTypeReference(
                            FernIr.ExampleTypeReferenceShape.named({
                                typeName: createDeclaredTypeName("MyBody"),
                                shape: FernIr.ExampleTypeShape.object({
                                    properties: [
                                        {
                                            name: createNameAndWireValue("name", "name"),
                                            value: createExampleTypeReference(stringPrimitive("test"), "test"),
                                            originalTypeDeclaration: createDeclaredTypeName("MyBody"),
                                            propertyAccess: undefined
                                        }
                                    ],
                                    extraProperties: undefined
                                })
                            }),
                            { name: "test" }
                        )
                    )
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // When flattened, properties should appear directly without "body" wrapper
            // The mock returns an object literal for named types
            expect(text).toContain("value");
            // Should NOT wrap in body property
            expect(text).not.toContain('"body"');
        });

        it("wraps non-object expression with bodyPropertyName when flattenRequestParameters is true", () => {
            const impl = createImpl({
                bodyPropertyName: "body",
                flattenRequestParameters: true,
                example: createExampleEndpointCall({
                    request: FernIr.ExampleRequestBody.reference(
                        createExampleTypeReference(stringPrimitive("simple-string"), "simple-string")
                    )
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // String literal is not an object literal, so it gets wrapped in body property
            expect(text).toContain("body");
            expect(text).toContain('"simple-string"');
        });
    });

    describe("build - combined properties", () => {
        it("includes query params, headers, and inlined body together", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    queryParameters: [
                        {
                            name: createNameAndWireValue("page", "page"),
                            value: createExampleTypeReference(integerPrimitive(1), 1),
                            shape: undefined
                        }
                    ],
                    serviceHeaders: [
                        {
                            name: createNameAndWireValue("auth", "Authorization"),
                            value: createExampleTypeReference(stringPrimitive("Bearer token"), "Bearer token")
                        }
                    ],
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("title", "title"),
                                value: createExampleTypeReference(stringPrimitive("My Post"), "My Post"),
                                originalTypeDeclaration: undefined
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("auth");
            expect(text).toContain("page");
            expect(text).toContain("title");
        });

        it("includes path params when inlined, plus query and body", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    servicePathParameters: [
                        {
                            name: casingsGenerator.generateName("orgId"),
                            value: createExampleTypeReference(stringPrimitive("org-1"), "org-1")
                        }
                    ],
                    queryParameters: [
                        {
                            name: createNameAndWireValue("search", "search"),
                            value: createExampleTypeReference(stringPrimitive("query"), "query"),
                            shape: undefined
                        }
                    ],
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        properties: [
                            {
                                name: createNameAndWireValue("content", "content"),
                                value: createExampleTypeReference(stringPrimitive("data"), "data"),
                                originalTypeDeclaration: undefined
                            }
                        ],
                        jsonExample: undefined,
                        extraProperties: undefined
                    })
                })
            });
            const context = createMockContext({ shouldInlinePathParameters: true });
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("orgId");
            expect(text).toContain("search");
            expect(text).toContain("content");
        });
    });

    describe("isNotLiteral", () => {
        it("returns true for primitive shapes", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    serviceHeaders: [
                        {
                            name: createNameAndWireValue("normalHeader", "X-Normal"),
                            value: createExampleTypeReference(stringPrimitive("val"), "val")
                        }
                    ]
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("normalHeader");
        });

        it("filters literal container shapes", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    serviceHeaders: [
                        {
                            name: createNameAndWireValue("litHeader", "X-Lit"),
                            value: createExampleTypeReference(literalShape("fixed"), "fixed")
                        }
                    ]
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).not.toContain("litHeader");
        });

        it("recursively unwraps named alias shapes", () => {
            // Create a named alias shape that wraps a literal
            const aliasWrappingLiteral = FernIr.ExampleTypeReferenceShape.named({
                typeName: createDeclaredTypeName("MyAlias"),
                shape: FernIr.ExampleTypeShape.alias({
                    value: createExampleTypeReference(literalShape("aliased-literal"), "aliased-literal")
                })
            });

            const impl = createImpl({
                example: createExampleEndpointCall({
                    serviceHeaders: [
                        {
                            name: createNameAndWireValue("aliasLiteral", "X-Alias-Lit"),
                            value: createExampleTypeReference(aliasWrappingLiteral, "aliased-literal")
                        }
                    ]
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            // Should be filtered because the alias unwraps to a literal
            expect(text).not.toContain("aliasLiteral");
        });

        it("allows named alias shapes wrapping non-literal values", () => {
            const aliasWrappingString = FernIr.ExampleTypeReferenceShape.named({
                typeName: createDeclaredTypeName("MyAlias"),
                shape: FernIr.ExampleTypeShape.alias({
                    value: createExampleTypeReference(stringPrimitive("non-literal"), "non-literal")
                })
            });

            const impl = createImpl({
                example: createExampleEndpointCall({
                    serviceHeaders: [
                        {
                            name: createNameAndWireValue("aliasString", "X-Alias-Str"),
                            value: createExampleTypeReference(aliasWrappingString, "non-literal")
                        }
                    ]
                })
            });
            const context = createMockContext();
            const result = impl.build(context, DEFAULT_OPTS);
            const text = getTextOfTsNode(result);

            expect(text).toContain("aliasString");
        });
    });

    describe("build - _other request type throws", () => {
        it("throws for unknown example request type", () => {
            const impl = createImpl({
                example: createExampleEndpointCall({
                    // biome-ignore lint/suspicious/noExplicitAny: test mock for _other branch
                    request: { type: "unknown", _visit: (visitor: any) => visitor._other() } as any
                })
            });
            const context = createMockContext();

            expect(() => impl.build(context, DEFAULT_OPTS)).toThrow("Encountered unknown example request type");
        });
    });
});
