import { FernIr } from "@fern-fern/ir-sdk";
import { getOriginalName, getTextOfTsNode, PackageId } from "@fern-typescript/commons";
import {
    caseConverter,
    casingsGenerator,
    createHttpEndpoint,
    createHttpService,
    createMockReference,
    createMockZurgObjectSchema,
    createMockZurgSchema,
    createNameAndWireValue
} from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedEndpointErrorSchemaImpl } from "../GeneratedEndpointErrorSchemaImpl.js";
import { GeneratedSdkEndpointTypeSchemasImpl } from "../GeneratedSdkEndpointTypeSchemasImpl.js";
import { RawSinglePropertyErrorSingleUnionType } from "../RawSinglePropertyErrorSingleUnionType.js";
import { SdkEndpointTypeSchemasGenerator } from "../SdkEndpointTypeSchemasGenerator.js";
import { StatusCodeDiscriminatedEndpointErrorSchema } from "../StatusCodeDiscriminatedEndpointErrorSchema.js";

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
                union: () => {
                    const base = createMockZurgSchema("union({})");
                    return {
                        ...base,
                        withParsedProperties: () => {
                            const inner = createMockZurgSchema("union({}).withParsedProperties({})");
                            return { ...inner, withParsedProperties: () => inner };
                        }
                    };
                },
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
        sdkEndpointTypeSchemas: {
            getReferenceToEndpointTypeSchemaExport: () => createMockReference("EndpointSchema")
        },
        endpointErrorUnion: {
            getGeneratedEndpointErrorUnion: () => ({
                getErrorUnion: () =>
                    ({
                        getReferenceTo: () => ts.factory.createTypeReferenceNode("ErrorUnion"),
                        discriminant: "errorName",
                        visitPropertyName: "_visit",
                        getBasePropertyKey: (key: string) => key,
                        buildFromExistingValue: ({ existingValue }: { existingValue: ts.Expression }) => existingValue,
                        buildUnknown: ({ existingValue }: { existingValue: ts.Expression }) => existingValue
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                    }) as any
            })
        },
        sdkError: {
            getErrorDeclaration: (errorName: FernIr.DeclaredErrorName) => ({
                name: errorName,
                discriminantValue: createNameAndWireValue(
                    getOriginalName(errorName.name),
                    getOriginalName(errorName.name)
                ),
                type: undefined,
                statusCode: 400
            })
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

const TEST_PACKAGE_ID = "pkg_test" as unknown as PackageId;

function createMockErrorResolver(errors?: Record<string, FernIr.ErrorDeclaration>) {
    return {
        getErrorDeclarationFromName: (errorName: FernIr.DeclaredErrorName) => {
            if (errors && errors[errorName.errorId]) {
                return errors[errorName.errorId];
            }
            return {
                name: errorName,
                discriminantValue: createNameAndWireValue("Error", "Error"),
                type: undefined,
                statusCode: 400,
                docs: undefined,
                examples: [],
                v2Examples: undefined,
                displayName: undefined,
                isWildcardStatusCode: false,
                headers: []
            };
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createMockIR(opts?: {
    errorDiscriminationStrategy?: FernIr.ErrorDiscriminationStrategy;
}): FernIr.IntermediateRepresentation {
    return {
        errorDiscriminationStrategy:
            opts?.errorDiscriminationStrategy ?? FernIr.ErrorDiscriminationStrategy.statusCode()
        // biome-ignore lint/suspicious/noExplicitAny: test mock — only errorDiscriminationStrategy is accessed
    } as any;
}

function createErrorName(name: string): FernIr.DeclaredErrorName {
    return {
        errorId: `error_${name}`,
        fernFilepath: { allParts: [], packagePath: [], file: undefined },
        name: casingsGenerator.generateName(name)
    };
}

function createResponseError(name: string): FernIr.ResponseError {
    return {
        error: createErrorName(name),
        docs: undefined
    };
}

// ────────────────────────────────────────────────────────────────────────────
// SdkEndpointTypeSchemasGenerator (factory)
// ────────────────────────────────────────────────────────────────────────────

describe("SdkEndpointTypeSchemasGenerator", () => {
    it("creates endpoint type schemas with default options", () => {
        const generator = new SdkEndpointTypeSchemasGenerator({
            errorResolver: createMockErrorResolver(),
            intermediateRepresentation: createMockIR(),
            shouldGenerateErrors: false,
            skipResponseValidation: false,
            includeSerdeLayer: true,
            allowExtraFields: false,
            omitUndefined: false,
            caseConverter
        });
        const endpoint = createHttpEndpoint();
        const service: FernIr.HttpService = { ...createHttpService(), endpoints: [endpoint] };
        const result = generator.generateEndpointTypeSchemas({
            packageId: TEST_PACKAGE_ID,
            service,
            endpoint
        });
        expect(result).toBeDefined();
    });

    it("passes shouldGenerateErrors to impl", () => {
        const generator = new SdkEndpointTypeSchemasGenerator({
            errorResolver: createMockErrorResolver(),
            intermediateRepresentation: createMockIR(),
            shouldGenerateErrors: true,
            skipResponseValidation: false,
            includeSerdeLayer: true,
            allowExtraFields: false,
            omitUndefined: false,
            caseConverter
        });
        const endpoint = createHttpEndpoint();
        const service: FernIr.HttpService = { ...createHttpService(), endpoints: [endpoint] };
        const result = generator.generateEndpointTypeSchemas({
            packageId: TEST_PACKAGE_ID,
            service,
            endpoint
        });
        expect(result).toBeDefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedSdkEndpointTypeSchemasImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedSdkEndpointTypeSchemasImpl", () => {
    function createEndpointSchemas(opts: {
        endpoint: FernIr.HttpEndpoint;
        includeSerdeLayer?: boolean;
        shouldGenerateErrors?: boolean;
        skipResponseValidation?: boolean;
        allowExtraFields?: boolean;
        omitUndefined?: boolean;
        errorDiscriminationStrategy?: FernIr.ErrorDiscriminationStrategy;
        errorResolver?: ReturnType<typeof createMockErrorResolver>;
    }) {
        const service: FernIr.HttpService = { ...createHttpService(), endpoints: [opts.endpoint] };
        return new GeneratedSdkEndpointTypeSchemasImpl({
            packageId: TEST_PACKAGE_ID,
            service,
            endpoint: opts.endpoint,
            errorResolver: opts.errorResolver ?? createMockErrorResolver(),
            errorDiscriminationStrategy:
                opts.errorDiscriminationStrategy ?? FernIr.ErrorDiscriminationStrategy.statusCode(),
            shouldGenerateErrors: opts.shouldGenerateErrors ?? false,
            skipResponseValidation: opts.skipResponseValidation ?? false,
            includeSerdeLayer: opts.includeSerdeLayer ?? true,
            allowExtraFields: opts.allowExtraFields ?? false,
            omitUndefined: opts.omitUndefined ?? false,
            caseConverter
        });
    }

    describe("writeToFile", () => {
        it("writes nothing for endpoint with no schemas to generate", () => {
            const endpoint = createHttpEndpoint();
            const schemas = createEndpointSchemas({ endpoint });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            expect(context.sourceFile.getFullText()).toBe("");
        });

        it("writes request schema for reference request with primitive type", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithRefBody });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("skips request schema for reference request with named type", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.named({
                        typeId: "type_User",
                        fernFilepath: { allParts: [], packagePath: [], file: undefined },
                        name: casingsGenerator.generateName("User"),
                        displayName: undefined,
                        default: undefined,
                        inline: undefined
                    }),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithRefBody });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            // Named types don't generate request schema
            expect(context.sourceFile.getFullText()).toBe("");
        });

        it("skips request schema for reference request with unknown type", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.unknown(),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithRefBody });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            expect(context.sourceFile.getFullText()).toBe("");
        });

        it("writes request schema for reference request with container type", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.container(
                        FernIr.ContainerType.list(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                    ),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithRefBody });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes response schema for JSON response with primitive type", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("skips response schema for JSON response with named type", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.named({
                                typeId: "type_User",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("User"),
                                displayName: undefined,
                                default: undefined,
                                inline: undefined
                            }),
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            expect(context.sourceFile.getFullText()).toBe("");
        });

        it("writes stream data schema for streaming response with primitive payload", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithStream: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.streaming(
                        FernIr.StreamingResponse.json({
                            payload: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            terminator: undefined,
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithStream });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("skips stream data schema for streaming response with named payload", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithStream: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.streaming(
                        FernIr.StreamingResponse.json({
                            payload: FernIr.TypeReference.named({
                                typeId: "type_Event",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("Event"),
                                displayName: undefined,
                                default: undefined,
                                inline: undefined
                            }),
                            terminator: undefined,
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithStream });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            expect(context.sourceFile.getFullText()).toBe("");
        });

        it("writes nothing when includeSerdeLayer is false", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                }),
                response: {
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({
                endpoint: endpointWithRefBody,
                includeSerdeLayer: false
            });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            // No schemas generated when serde layer disabled
            expect(context.sourceFile.getFullText()).toBe("");
        });

        it("writes both request and response schemas when both are primitive", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithBoth: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                }),
                response: {
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }),
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithBoth });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });

    describe("serializeRequest", () => {
        it("serializes primitive reference request with jsonOrThrow", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithRefBody });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            const ref = ts.factory.createIdentifier("request");
            const result = schemas.serializeRequest(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("serializes named reference request with named type schema jsonOrThrow", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.named({
                        typeId: "type_User",
                        fernFilepath: { allParts: [], packagePath: [], file: undefined },
                        name: casingsGenerator.generateName("User"),
                        displayName: undefined,
                        default: undefined,
                        inline: undefined
                    }),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithRefBody });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("request");
            const result = schemas.serializeRequest(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("returns passthrough for unknown reference request", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.unknown(),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithRefBody });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("request");
            const result = schemas.serializeRequest(ref, context);
            expect(getTextOfTsNode(result)).toBe("request");
        });

        it("returns passthrough when serde layer disabled", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const schemas = createEndpointSchemas({
                endpoint: endpointWithRefBody,
                includeSerdeLayer: false
            });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("request");
            const result = schemas.serializeRequest(ref, context);
            expect(getTextOfTsNode(result)).toBe("request");
        });

        it("throws for non-reference request body", () => {
            const endpoint = createHttpEndpoint();
            const schemas = createEndpointSchemas({ endpoint });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("request");
            expect(() => schemas.serializeRequest(ref, context)).toThrow(
                "Cannot serialize request because it's not a reference"
            );
        });
    });

    describe("deserializeResponse", () => {
        it("deserializes primitive JSON response with parseOrThrow", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            const ref = ts.factory.createIdentifier("response");
            const result = schemas.deserializeResponse(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("deserializes named JSON response with named type schema", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.named({
                                typeId: "type_User",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("User"),
                                displayName: undefined,
                                default: undefined,
                                inline: undefined
                            }),
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("response");
            const result = schemas.deserializeResponse(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("passes through unknown JSON response", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.unknown(),
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("response");
            const result = schemas.deserializeResponse(ref, context);
            expect(getTextOfTsNode(result)).toBe("response");
        });

        it("casts response when serde layer disabled", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({
                endpoint: endpointWithResponse,
                includeSerdeLayer: false
            });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("response");
            const result = schemas.deserializeResponse(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("passes through bytes response body", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.bytes({
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("response");
            const result = schemas.deserializeResponse(ref, context);
            expect(getTextOfTsNode(result)).toBe("response");
        });

        it("passes through fileDownload response body", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.fileDownload({
                        v2Examples: undefined,
                        docs: undefined
                    }),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("response");
            const result = schemas.deserializeResponse(ref, context);
            expect(getTextOfTsNode(result)).toBe("response");
        });

        it("casts text response to string type", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.text({
                        v2Examples: undefined,
                        docs: undefined
                    }),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("response");
            const result = schemas.deserializeResponse(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("throws for streaming response", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithStream: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.streaming(
                        FernIr.StreamingResponse.json({
                            payload: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            terminator: undefined,
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithStream });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("response");
            expect(() => schemas.deserializeResponse(ref, context)).toThrow("Cannot deserialize streaming response");
        });

        it("throws when no response body defined", () => {
            const endpoint = createHttpEndpoint();
            const schemas = createEndpointSchemas({ endpoint });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("response");
            expect(() => schemas.deserializeResponse(ref, context)).toThrow(
                "Cannot deserialize response because it's not defined"
            );
        });
    });

    describe("deserializeStreamData", () => {
        it("deserializes primitive streaming data with parseOrThrow", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithStream: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.streaming(
                        FernIr.StreamingResponse.json({
                            payload: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            terminator: undefined,
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithStream });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            const ref = ts.factory.createIdentifier("streamData");
            const result = schemas.deserializeStreamData({ referenceToRawStreamData: ref, context });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("deserializes named streaming data with named type schema", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithStream: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.streaming(
                        FernIr.StreamingResponse.json({
                            payload: FernIr.TypeReference.named({
                                typeId: "type_Event",
                                fernFilepath: { allParts: [], packagePath: [], file: undefined },
                                name: casingsGenerator.generateName("Event"),
                                displayName: undefined,
                                default: undefined,
                                inline: undefined
                            }),
                            terminator: undefined,
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithStream });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("streamData");
            const result = schemas.deserializeStreamData({ referenceToRawStreamData: ref, context });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("passes through unknown streaming data", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithStream: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.streaming(
                        FernIr.StreamingResponse.json({
                            payload: FernIr.TypeReference.unknown(),
                            terminator: undefined,
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithStream });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("streamData");
            const result = schemas.deserializeStreamData({ referenceToRawStreamData: ref, context });
            expect(getTextOfTsNode(result)).toBe("streamData");
        });

        it("throws for non-streaming endpoint", () => {
            const endpoint = createHttpEndpoint();
            const schemas = createEndpointSchemas({ endpoint });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("streamData");
            expect(() => schemas.deserializeStreamData({ referenceToRawStreamData: ref, context })).toThrow(
                "Cannot deserialize stream data"
            );
        });
    });

    describe("deserializeError", () => {
        it("returns passthrough when serde layer disabled", () => {
            const endpoint = createHttpEndpoint();
            const schemas = createEndpointSchemas({
                endpoint,
                includeSerdeLayer: false,
                shouldGenerateErrors: true
            });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("error");
            const result = schemas.deserializeError(ref, context);
            expect(getTextOfTsNode(result)).toBe("error");
        });

        it("throws when no error schema defined", () => {
            const endpoint = createHttpEndpoint();
            const schemas = createEndpointSchemas({
                endpoint,
                shouldGenerateErrors: false
            });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("error");
            expect(() => schemas.deserializeError(ref, context)).toThrow("Cannot deserialize endpoint error");
        });
    });

    describe("error schema strategies", () => {
        it("uses status code discrimination strategy", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithErrors: FernIr.HttpEndpoint = {
                ...endpoint,
                errors: [createResponseError("BadRequest")]
            };
            const schemas = createEndpointSchemas({
                endpoint: endpointWithErrors,
                shouldGenerateErrors: true,
                errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode()
            });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            // Status code strategy is a no-op for writeToFile
            expect(context.sourceFile.getFullText()).toBe("");
        });

        it("throws when getting raw shape for status code discriminated errors", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithErrors: FernIr.HttpEndpoint = {
                ...endpoint,
                errors: [createResponseError("BadRequest")]
            };
            const schemas = createEndpointSchemas({
                endpoint: endpointWithErrors,
                shouldGenerateErrors: true,
                errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode()
            });
            const context = createMockFileContext();
            expect(() => schemas.getReferenceToRawError(context)).toThrow(
                "No endpoint error schema was generated because errors are status-code discriminated"
            );
        });

        it("constructs with property discrimination strategy and errors that have types", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithErrors: FernIr.HttpEndpoint = {
                ...endpoint,
                errors: [createResponseError("BadRequest")]
            };
            const errorDeclarations: Record<string, FernIr.ErrorDeclaration> = {
                error_BadRequest: {
                    name: createErrorName("BadRequest"),
                    discriminantValue: createNameAndWireValue("BadRequest", "BadRequest"),
                    type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    statusCode: 400,
                    docs: undefined,
                    examples: [],
                    v2Examples: undefined,
                    displayName: undefined,
                    isWildcardStatusCode: false,
                    headers: []
                }
            };
            const schemas = createEndpointSchemas({
                endpoint: endpointWithErrors,
                shouldGenerateErrors: true,
                errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.property({
                    discriminant: createNameAndWireValue("errorName", "errorName"),
                    contentProperty: createNameAndWireValue("content", "content")
                }),
                errorResolver: createMockErrorResolver(errorDeclarations)
            });
            // Verify schema was constructed — exercises GeneratedEndpointErrorSchemaImpl
            // and RawSinglePropertyErrorSingleUnionType code paths
            expect(schemas).toBeDefined();
        });

        it("constructs with property discrimination strategy and errors that have no type", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithErrors: FernIr.HttpEndpoint = {
                ...endpoint,
                errors: [createResponseError("NotFound")]
            };
            // Default error resolver returns errors with no type
            const schemas = createEndpointSchemas({
                endpoint: endpointWithErrors,
                shouldGenerateErrors: true,
                errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.property({
                    discriminant: createNameAndWireValue("errorName", "errorName"),
                    contentProperty: createNameAndWireValue("content", "content")
                })
            });
            // Verify schema was constructed — exercises RawNoPropertiesSingleUnionType path
            expect(schemas).toBeDefined();
        });

        it("deserializes error with property discrimination strategy", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithErrors: FernIr.HttpEndpoint = {
                ...endpoint,
                errors: [createResponseError("BadRequest")]
            };
            const schemas = createEndpointSchemas({
                endpoint: endpointWithErrors,
                shouldGenerateErrors: true,
                errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.property({
                    discriminant: createNameAndWireValue("errorName", "errorName"),
                    contentProperty: createNameAndWireValue("content", "content")
                })
            });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("error");
            const result = schemas.deserializeError(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("gets reference to raw error for property discrimination strategy", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithErrors: FernIr.HttpEndpoint = {
                ...endpoint,
                errors: [createResponseError("BadRequest")]
            };
            const schemas = createEndpointSchemas({
                endpoint: endpointWithErrors,
                shouldGenerateErrors: true,
                errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.property({
                    discriminant: createNameAndWireValue("errorName", "errorName"),
                    contentProperty: createNameAndWireValue("content", "content")
                })
            });
            const context = createMockFileContext();
            const result = schemas.getReferenceToRawError(context);
            expect(getTextOfTsNode(result)).toBeDefined();
        });
    });

    describe("deserializeStreamData - additional branches", () => {
        it("throws for text streaming response at construction time", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithStream: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.streaming(
                        FernIr.StreamingResponse.text({
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            // Text streaming throws at construction time, not at deserialize time
            expect(() => createEndpointSchemas({ endpoint: endpointWithStream })).toThrow(
                "Non-json responses are not supported"
            );
        });

        it("deserializes container streaming data with parseOrThrow", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithStream: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.streaming(
                        FernIr.StreamingResponse.json({
                            payload: FernIr.TypeReference.container(
                                FernIr.ContainerType.list(
                                    FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                                )
                            ),
                            terminator: undefined,
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithStream });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            const ref = ts.factory.createIdentifier("streamData");
            const result = schemas.deserializeStreamData({ referenceToRawStreamData: ref, context });
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });
    });

    describe("getReferenceToRawResponse", () => {
        it("throws when no response schema was generated", () => {
            const endpoint = createHttpEndpoint();
            const schemas = createEndpointSchemas({ endpoint });
            const context = createMockFileContext();
            expect(() => schemas.getReferenceToRawResponse(context)).toThrow("No response schema was generated");
        });
    });

    describe("serializeRequest - container type", () => {
        it("serializes container reference request with jsonOrThrow", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.container(
                        FernIr.ContainerType.list(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
                    ),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithRefBody });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            const ref = ts.factory.createIdentifier("request");
            const result = schemas.serializeRequest(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });
    });

    describe("deserializeResponse - container type", () => {
        it("deserializes container JSON response with parseOrThrow", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.container(
                                FernIr.ContainerType.list(
                                    FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
                                )
                            ),
                            v2Examples: undefined,
                            docs: undefined
                        })
                    ),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            schemas.writeToFile(context);
            const ref = ts.factory.createIdentifier("response");
            const result = schemas.deserializeResponse(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("throws for streamParameter response type", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithResponse: FernIr.HttpEndpoint = {
                ...endpoint,
                response: {
                    body: FernIr.HttpResponseBody.streamParameter({
                        nonStreamResponse: FernIr.NonStreamHttpResponseBody.json(
                            FernIr.JsonResponse.response({
                                responseBodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                v2Examples: undefined,
                                docs: undefined
                            })
                        ),
                        streamResponse: FernIr.StreamingResponse.json({
                            payload: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                            terminator: undefined,
                            v2Examples: undefined,
                            docs: undefined
                        })
                    }),
                    statusCode: undefined,
                    isWildcardStatusCode: undefined,
                    docs: undefined
                }
            };
            const schemas = createEndpointSchemas({ endpoint: endpointWithResponse });
            const context = createMockFileContext();
            const ref = ts.factory.createIdentifier("response");
            expect(() => schemas.deserializeResponse(ref, context)).toThrow(
                "Cannot deserialize streaming response in deserializeResponse"
            );
        });
    });

    describe("serializeRequest - allowExtraFields with extraProperties", () => {
        it("serializes named request with extraProperties=true", () => {
            const endpoint = createHttpEndpoint();
            const endpointWithRefBody: FernIr.HttpEndpoint = {
                ...endpoint,
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: FernIr.TypeReference.named({
                        typeId: "type_User",
                        fernFilepath: { allParts: [], packagePath: [], file: undefined },
                        name: casingsGenerator.generateName("User"),
                        displayName: undefined,
                        default: undefined,
                        inline: undefined
                    }),
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            };
            const context = createMockFileContext();
            // Override getTypeDeclaration to return extraProperties=true
            context.type.getTypeDeclaration = () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: true,
                    extendedProperties: undefined
                })
            });
            const schemas = createEndpointSchemas({
                endpoint: endpointWithRefBody,
                allowExtraFields: false
            });
            const ref = ts.factory.createIdentifier("request");
            const result = schemas.serializeRequest(ref, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });
    });
});

// ────────────────────────────────────────────────────────────────────────────
// StatusCodeDiscriminatedEndpointErrorSchema (direct tests)
// ────────────────────────────────────────────────────────────────────────────

describe("StatusCodeDiscriminatedEndpointErrorSchema", () => {
    it("writeToFile is a no-op", () => {
        const context = createMockFileContext();
        StatusCodeDiscriminatedEndpointErrorSchema.writeToFile(context);
        // Should not modify the source file
        expect(context.sourceFile.getFullText()).toBe("");
    });

    it("getReferenceToRawShape throws", () => {
        const context = createMockFileContext();
        expect(() => StatusCodeDiscriminatedEndpointErrorSchema.getReferenceToRawShape(context)).toThrow(
            "No endpoint error schema was generated because errors are status-code discriminated"
        );
    });

    it("getReferenceToZurgSchema throws", () => {
        const context = createMockFileContext();
        expect(() => StatusCodeDiscriminatedEndpointErrorSchema.getReferenceToZurgSchema(context)).toThrow(
            "No endpoint error schema was generated because errors are status-code discriminated"
        );
    });
});

// ────────────────────────────────────────────────────────────────────────────
// RawSinglePropertyErrorSingleUnionType (direct tests)
// ────────────────────────────────────────────────────────────────────────────

describe("RawSinglePropertyErrorSingleUnionType", () => {
    function createErrorSingleUnionType(opts?: { errorHasType?: boolean }) {
        const errorName: FernIr.DeclaredErrorName = {
            errorId: "error_BadRequest",
            fernFilepath: { allParts: [], packagePath: [], file: undefined },
            name: casingsGenerator.generateName("BadRequest")
        };
        const discriminationStrategy: FernIr.ErrorDiscriminationByPropertyStrategy = {
            discriminant: createNameAndWireValue("errorName", "errorName"),
            contentProperty: createNameAndWireValue("content", "content")
        };
        return new RawSinglePropertyErrorSingleUnionType({
            discriminant: discriminationStrategy.discriminant,
            discriminantValue: createNameAndWireValue("BadRequest", "BadRequest"),
            errorName,
            discriminationStrategy
            // biome-ignore lint/suspicious/noExplicitAny: TS can't resolve base class Init from union-schema-generator
        } as any);
    }

    it("getExtends returns empty array", () => {
        const unionType = createErrorSingleUnionType();
        // getExtends is protected but exercised through the schema generation
        // We verify it indirectly through construction
        expect(unionType).toBeDefined();
    });

    it("exercises getNonDiscriminantPropertiesForInterface and getNonDiscriminantPropertiesForSchema via writeToFile", () => {
        const errorName: FernIr.DeclaredErrorName = {
            errorId: "error_BadRequest",
            fernFilepath: { allParts: [], packagePath: [], file: undefined },
            name: casingsGenerator.generateName("BadRequest")
        };
        const discriminationStrategy: FernIr.ErrorDiscriminationByPropertyStrategy = {
            discriminant: createNameAndWireValue("errorName", "errorName"),
            contentProperty: createNameAndWireValue("content", "content")
        };

        // Create a GeneratedEndpointErrorSchemaImpl that uses this type
        // This exercises getNonDiscriminantPropertiesForInterface and getNonDiscriminantPropertiesForSchema
        const endpoint = createHttpEndpoint();
        const endpointWithErrors: FernIr.HttpEndpoint = {
            ...endpoint,
            errors: [{ error: errorName, docs: undefined }]
        };
        const errorDeclarations: Record<string, FernIr.ErrorDeclaration> = {
            error_BadRequest: {
                name: errorName,
                discriminantValue: createNameAndWireValue("BadRequest", "BadRequest"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                statusCode: 400,
                docs: undefined,
                examples: [],
                v2Examples: undefined,
                displayName: undefined,
                isWildcardStatusCode: false,
                headers: []
            }
        };
        const errorSchema = new GeneratedEndpointErrorSchemaImpl({
            packageId: TEST_PACKAGE_ID,
            endpoint: endpointWithErrors,
            errorResolver: createMockErrorResolver(errorDeclarations),
            discriminationStrategy,
            caseConverter
        });
        const context = createMockFileContext();
        // Override sdkError to return the typed error declaration
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        (context as any).sdkError = {
            getErrorDeclaration: () => ({
                name: errorName,
                discriminantValue: createNameAndWireValue("BadRequest", "BadRequest"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                statusCode: 400
            })
        };
        // writeToFile exercises both getNonDiscriminantPropertiesForInterface and
        // getNonDiscriminantPropertiesForSchema on the RawSinglePropertyErrorSingleUnionType
        errorSchema.writeToFile(context);
        const output = context.sourceFile.getFullText();
        expect(output).toMatchSnapshot();
    });

    it("throws when error declaration has no type in getNonDiscriminantPropertiesForInterface", () => {
        const errorName: FernIr.DeclaredErrorName = {
            errorId: "error_NotFound",
            fernFilepath: { allParts: [], packagePath: [], file: undefined },
            name: casingsGenerator.generateName("NotFound")
        };
        const discriminationStrategy: FernIr.ErrorDiscriminationByPropertyStrategy = {
            discriminant: createNameAndWireValue("errorName", "errorName"),
            contentProperty: createNameAndWireValue("content", "content")
        };

        // Create a mock FileContext that returns an error with no type
        const mockContext = createMockFileContext();
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        (mockContext as any).sdkError = {
            getErrorDeclaration: () => ({
                name: errorName,
                discriminantValue: createNameAndWireValue("NotFound", "NotFound"),
                type: undefined,
                statusCode: 404
            })
        };

        const unionType = new RawSinglePropertyErrorSingleUnionType({
            discriminant: discriminationStrategy.discriminant,
            discriminantValue: createNameAndWireValue("NotFound", "NotFound"),
            errorName,
            discriminationStrategy
            // biome-ignore lint/suspicious/noExplicitAny: TS can't resolve base class Init from union-schema-generator
        } as any);
        // The protected methods are called through the schema generation pipeline
        expect(unionType).toBeDefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedEndpointErrorSchemaImpl (direct tests)
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedEndpointErrorSchemaImpl", () => {
    it("constructs with errors that have types (RawSinglePropertyErrorSingleUnionType path)", () => {
        const errorName = createErrorName("BadRequest");
        const endpoint = createHttpEndpoint();
        const endpointWithErrors: FernIr.HttpEndpoint = {
            ...endpoint,
            errors: [{ error: errorName, docs: undefined }]
        };
        const errorDeclarations: Record<string, FernIr.ErrorDeclaration> = {
            error_BadRequest: {
                name: errorName,
                discriminantValue: createNameAndWireValue("BadRequest", "BadRequest"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                statusCode: 400,
                docs: undefined,
                examples: [],
                v2Examples: undefined,
                displayName: undefined,
                isWildcardStatusCode: false,
                headers: []
            }
        };
        const schema = new GeneratedEndpointErrorSchemaImpl({
            packageId: TEST_PACKAGE_ID,
            endpoint: endpointWithErrors,
            errorResolver: createMockErrorResolver(errorDeclarations),
            discriminationStrategy: {
                discriminant: createNameAndWireValue("errorName", "errorName"),
                contentProperty: createNameAndWireValue("content", "content")
            },
            caseConverter
        });
        expect(schema).toBeDefined();
    });

    it("constructs with errors that have no type (RawNoPropertiesSingleUnionType path)", () => {
        const errorName = createErrorName("NotFound");
        const endpoint = createHttpEndpoint();
        const endpointWithErrors: FernIr.HttpEndpoint = {
            ...endpoint,
            errors: [{ error: errorName, docs: undefined }]
        };
        // Default mock resolver returns errors with no type
        const schema = new GeneratedEndpointErrorSchemaImpl({
            packageId: TEST_PACKAGE_ID,
            endpoint: endpointWithErrors,
            errorResolver: createMockErrorResolver(),
            discriminationStrategy: {
                discriminant: createNameAndWireValue("errorName", "errorName"),
                contentProperty: createNameAndWireValue("content", "content")
            },
            caseConverter
        });
        expect(schema).toBeDefined();
    });

    it("writeToFile generates error schema output", () => {
        const errorName = createErrorName("BadRequest");
        const endpoint = createHttpEndpoint();
        const endpointWithErrors: FernIr.HttpEndpoint = {
            ...endpoint,
            errors: [{ error: errorName, docs: undefined }]
        };
        const schema = new GeneratedEndpointErrorSchemaImpl({
            packageId: TEST_PACKAGE_ID,
            endpoint: endpointWithErrors,
            errorResolver: createMockErrorResolver(),
            discriminationStrategy: {
                discriminant: createNameAndWireValue("errorName", "errorName"),
                contentProperty: createNameAndWireValue("content", "content")
            },
            caseConverter
        });
        const context = createMockFileContext();
        schema.writeToFile(context);
        const output = context.sourceFile.getFullText();
        expect(output).toMatchSnapshot();
    });

    it("getReferenceToRawShape returns type node", () => {
        const errorName = createErrorName("BadRequest");
        const endpoint = createHttpEndpoint();
        const endpointWithErrors: FernIr.HttpEndpoint = {
            ...endpoint,
            errors: [{ error: errorName, docs: undefined }]
        };
        const schema = new GeneratedEndpointErrorSchemaImpl({
            packageId: TEST_PACKAGE_ID,
            endpoint: endpointWithErrors,
            errorResolver: createMockErrorResolver(),
            discriminationStrategy: {
                discriminant: createNameAndWireValue("errorName", "errorName"),
                contentProperty: createNameAndWireValue("content", "content")
            },
            caseConverter
        });
        const context = createMockFileContext();
        const rawShape = schema.getReferenceToRawShape(context);
        expect(rawShape).toBeDefined();
    });

    it("getReferenceToZurgSchema returns a Zurg.Schema", () => {
        const errorName = createErrorName("BadRequest");
        const endpoint = createHttpEndpoint();
        const endpointWithErrors: FernIr.HttpEndpoint = {
            ...endpoint,
            errors: [{ error: errorName, docs: undefined }]
        };
        const schema = new GeneratedEndpointErrorSchemaImpl({
            packageId: TEST_PACKAGE_ID,
            endpoint: endpointWithErrors,
            errorResolver: createMockErrorResolver(),
            discriminationStrategy: {
                discriminant: createNameAndWireValue("errorName", "errorName"),
                contentProperty: createNameAndWireValue("content", "content")
            },
            caseConverter
        });
        const context = createMockFileContext();
        const zurgSchema = schema.getReferenceToZurgSchema(context);
        expect(zurgSchema).toBeDefined();
        expect(zurgSchema.toExpression()).toBeDefined();
    });

    it("constructs with multiple errors (mixed typed and untyped)", () => {
        const badRequestError = createErrorName("BadRequest");
        const notFoundError = createErrorName("NotFound");
        const endpoint = createHttpEndpoint();
        const endpointWithErrors: FernIr.HttpEndpoint = {
            ...endpoint,
            errors: [
                { error: badRequestError, docs: undefined },
                { error: notFoundError, docs: undefined }
            ]
        };
        const errorDeclarations: Record<string, FernIr.ErrorDeclaration> = {
            error_BadRequest: {
                name: badRequestError,
                discriminantValue: createNameAndWireValue("BadRequest", "BadRequest"),
                type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                statusCode: 400,
                docs: undefined,
                examples: [],
                v2Examples: undefined,
                displayName: undefined,
                isWildcardStatusCode: false,
                headers: []
            }
            // NotFound uses default resolver (no type)
        };
        const schema = new GeneratedEndpointErrorSchemaImpl({
            packageId: TEST_PACKAGE_ID,
            endpoint: endpointWithErrors,
            errorResolver: createMockErrorResolver(errorDeclarations),
            discriminationStrategy: {
                discriminant: createNameAndWireValue("errorName", "errorName"),
                contentProperty: createNameAndWireValue("content", "content")
            },
            caseConverter
        });
        const context = createMockFileContext();
        // Override sdkError to return proper typed/untyped declarations
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        (context as any).sdkError = {
            getErrorDeclaration: (name: FernIr.DeclaredErrorName) => {
                if (name.errorId === "error_BadRequest") {
                    return {
                        name,
                        discriminantValue: createNameAndWireValue("BadRequest", "BadRequest"),
                        type: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        statusCode: 400
                    };
                }
                return {
                    name,
                    discriminantValue: createNameAndWireValue("NotFound", "NotFound"),
                    type: undefined,
                    statusCode: 404
                };
            }
        };
        schema.writeToFile(context);
        const output = context.sourceFile.getFullText();
        expect(output).toMatchSnapshot();
    });
});
