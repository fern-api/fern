import assert from "node:assert";
import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
    createDeclaredTypeName,
    createHttpEndpoint,
    createHttpHeader,
    createHttpService,
    createInlinedRequestBody,
    createInlinedRequestBodyProperty,
    createNameAndWireValue,
    createNamedTypeReference,
    createObjectProperty,
    createPathParameter,
    createQueryParameter,
    createSdkRequestWrapper,
    serializeStatements
} from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedRequestWrapperImpl } from "../GeneratedRequestWrapperImpl.js";

// ── Helpers ────────────────────────────────────────────────────────────

const STRING_TYPE = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
const INTEGER_TYPE = FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined });
const OPTIONAL_STRING_TYPE = FernIr.TypeReference.container(
    FernIr.ContainerType.optional(FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }))
);
const OPTIONAL_INT_TYPE = FernIr.TypeReference.container(
    FernIr.ContainerType.optional(FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined }))
);

function createDefaultInit(overrides?: Partial<GeneratedRequestWrapperImpl.Init>): GeneratedRequestWrapperImpl.Init {
    return {
        service: createHttpService(),
        endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() }),
        wrapperName: "TestRequest",
        packageId: { isRoot: true },
        includeSerdeLayer: true,
        retainOriginalCasing: false,
        inlineFileProperties: false,
        enableInlineTypes: false,
        shouldInlinePathParameters: false,
        formDataSupport: "Node18",
        flattenRequestParameters: false,
        parameterNaming: "default",
        caseConverter,
        resolveQueryParameterNameConflicts: false,
        ...overrides
    };
}

/**
 * Creates a mock FileContext that satisfies all property accesses used by GeneratedRequestWrapperImpl.
 * Uses a real ts-morph SourceFile for interface/module generation.
 */
function createMockContext(opts?: {
    shouldInlinePathParameters?: boolean;
    enableInlineTypes?: boolean;
    namespaceExport?: string;
    useDefaultRequestParameterValues?: boolean;
    isOptionalFn?: (typeRef: FernIr.TypeReference) => boolean;
    isNullableFn?: (typeRef: FernIr.TypeReference) => boolean;
    hasDefaultValueFn?: (typeRef: FernIr.TypeReference) => boolean;
    resolveTypeReferenceFn?: (typeRef: FernIr.TypeReference) => FernIr.TypeReference;
    formDataSupport?: "Node16" | "Node18";
    getTypeDeclarationFn?: (namedType: FernIr.DeclaredTypeName) => FernIr.TypeDeclaration;
    // biome-ignore lint/suspicious/noExplicitAny: mock factory returns loosely-typed generated type stubs
    getGeneratedTypeFn?: (namedType: FernIr.DeclaredTypeName, typeNameOverride?: string) => any;
}) {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");

    const defaultResolve = (typeRef: FernIr.TypeReference): FernIr.TypeReference => typeRef;

    const context = {
        requestWrapper: {
            shouldInlinePathParameters: () => opts?.shouldInlinePathParameters ?? false
        },
        type: {
            getReferenceToType: (typeRef: FernIr.TypeReference) => {
                const resolved = (opts?.resolveTypeReferenceFn ?? defaultResolve)(typeRef);
                const isOpt = resolved.type === "container" && resolved.container.type === "optional";
                const innerType =
                    isOpt && resolved.type === "container" && resolved.container.type === "optional"
                        ? resolved.container.optional
                        : resolved;

                const typeNode = primitiveToTypeNode(innerType);
                return {
                    typeNode: isOpt
                        ? ts.factory.createUnionTypeNode([
                              typeNode,
                              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                          ])
                        : typeNode,
                    typeNodeWithoutUndefined: typeNode,
                    isOptional: isOpt,
                    requestTypeNode: typeNode,
                    requestTypeNodeWithoutUndefined: typeNode,
                    responseTypeNode: typeNode,
                    responseTypeNodeWithoutUndefined: typeNode
                };
            },
            getReferenceToNamedType: (namedType: FernIr.DeclaredTypeName) => ({
                getTypeNode: () => ts.factory.createTypeReferenceNode(caseConverter.pascalSafe(namedType.name))
            }),
            getReferenceToInlinePropertyType: (
                typeRef: FernIr.TypeReference,
                _parentName: string,
                _propName: string
            ) => {
                const resolved = (opts?.resolveTypeReferenceFn ?? defaultResolve)(typeRef);
                const isOpt = resolved.type === "container" && resolved.container.type === "optional";
                const innerType =
                    isOpt && resolved.type === "container" && resolved.container.type === "optional"
                        ? resolved.container.optional
                        : resolved;
                const typeNode = primitiveToTypeNode(innerType);
                return {
                    typeNode: isOpt
                        ? ts.factory.createUnionTypeNode([
                              typeNode,
                              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword)
                          ])
                        : typeNode,
                    typeNodeWithoutUndefined: typeNode,
                    isOptional: isOpt,
                    requestTypeNode: typeNode,
                    requestTypeNodeWithoutUndefined: typeNode,
                    responseTypeNode: typeNode,
                    responseTypeNodeWithoutUndefined: typeNode
                };
            },
            resolveTypeReference: opts?.resolveTypeReferenceFn ?? defaultResolve,
            getTypeDeclaration: () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            }),
            getGeneratedType: () => ({
                type: "object",
                getAllPropertiesIncludingExtensions: () => [],
                generateStatements: () => []
            }),
            isOptional:
                opts?.isOptionalFn ??
                ((typeRef: FernIr.TypeReference) =>
                    typeRef.type === "container" && typeRef.container.type === "optional"),
            isNullable: opts?.isNullableFn ?? (() => false),
            hasDefaultValue: opts?.hasDefaultValueFn ?? (() => false)
        },
        sourceFile,
        config: {
            customConfig: {
                useDefaultRequestParameterValues: opts?.useDefaultRequestParameterValues ?? false
            }
        },
        externalDependencies: {
            fs: {
                ReadStream: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("fs.ReadStream")
                }
            }
        },
        coreUtilities: {
            fileUtils: {
                Uploadable: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("Uploadable")
                }
            }
        },
        enableInlineTypes: opts?.enableInlineTypes ?? false,
        namespaceExport: opts?.namespaceExport ?? "TestNamespace",
        case: caseConverter
        // biome-ignore lint/suspicious/noExplicitAny: minimal FileContext mock for request wrapper tests
    } as any;

    // Allow overriding getTypeDeclaration for tests that need type declarations with properties
    if (opts?.getTypeDeclarationFn) {
        context.type.getTypeDeclaration = opts.getTypeDeclarationFn;
    }
    if (opts?.getGeneratedTypeFn) {
        context.type.getGeneratedType = opts.getGeneratedTypeFn;
    }

    return { context, sourceFile };
}

function primitiveToTypeNode(typeRef: FernIr.TypeReference): ts.TypeNode {
    if (typeRef.type === "primitive") {
        switch (typeRef.primitive.v1) {
            case "STRING":
                return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
            case "INTEGER":
            case "LONG":
            case "DOUBLE":
            case "FLOAT":
                return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
            case "BOOLEAN":
                return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
            default:
                return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
        }
    }
    if (typeRef.type === "container" && typeRef.container.type === "optional") {
        return primitiveToTypeNode(typeRef.container.optional);
    }
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
}

function createFileUploadRequestBody(opts: {
    properties: FernIr.FileUploadRequestProperty[];
    name?: string;
}): FernIr.HttpRequestBody {
    return FernIr.HttpRequestBody.fileUpload({
        name: {
            originalName: opts.name ?? "MyRequest",
            camelCase: { unsafeName: opts.name ?? "myRequest", safeName: opts.name ?? "myRequest" },
            snakeCase: { unsafeName: opts.name ?? "my_request", safeName: opts.name ?? "my_request" },
            screamingSnakeCase: { unsafeName: opts.name ?? "MY_REQUEST", safeName: opts.name ?? "MY_REQUEST" },
            pascalCase: { unsafeName: opts.name ?? "MyRequest", safeName: opts.name ?? "MyRequest" }
        },
        properties: opts.properties,
        docs: undefined,
        v2Examples: undefined,
        contentType: undefined
    });
}

function createFileProperty(
    name: string,
    opts?: { isOptional?: boolean; type?: "file" | "fileArray" }
): FernIr.FileUploadRequestProperty {
    const base = {
        key: createNameAndWireValue(name),
        isOptional: opts?.isOptional ?? false,
        contentType: undefined,
        docs: undefined
    };
    const filePropertyValue =
        opts?.type === "fileArray" ? FernIr.FileProperty.fileArray(base) : FernIr.FileProperty.file(base);
    return FernIr.FileUploadRequestProperty.file(filePropertyValue);
}

function createBodyPropertyForUpload(name: string, valueType: FernIr.TypeReference): FernIr.FileUploadRequestProperty {
    return FernIr.FileUploadRequestProperty.bodyProperty({
        ...createInlinedRequestBodyProperty(name, valueType),
        contentType: undefined,
        style: undefined
    });
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("GeneratedRequestWrapperImpl", () => {
    // ── writeToFile: basic interface generation ────────────────────────

    describe("writeToFile", () => {
        it("generates empty interface with no properties", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with query parameters", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [
                        createQueryParameter("cursor", OPTIONAL_STRING_TYPE),
                        createQueryParameter("limit", OPTIONAL_INT_TYPE)
                    ],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with required query parameters", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [
                        createQueryParameter("plantId", STRING_TYPE),
                        createQueryParameter("name", STRING_TYPE)
                    ],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with allowMultiple query parameter", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("tags", STRING_TYPE, { allowMultiple: true })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with non-literal headers", () => {
            const init = createDefaultInit({
                service: createHttpService({
                    headers: [createHttpHeader("xCustom", STRING_TYPE, { wireValue: "X-Custom" })]
                }),
                endpoint: createHttpEndpoint({
                    headers: [createHttpHeader("xRequestId", STRING_TYPE, { wireValue: "X-Request-Id" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("filters out literal headers", () => {
            const literalType = FernIr.TypeReference.container(
                FernIr.ContainerType.literal(FernIr.Literal.string("fixed-value"))
            );
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    headers: [
                        createHttpHeader("xLiteral", literalType, { wireValue: "X-Literal" }),
                        createHttpHeader("xDynamic", STRING_TYPE, { wireValue: "X-Dynamic" })
                    ],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            // Only xDynamic should appear, xLiteral is filtered out
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with inlined path parameters", () => {
            const servicePathParam = createPathParameter("organizationId", "ROOT");
            const endpointPathParam = createPathParameter("plantId", "ENDPOINT");
            const init = createDefaultInit({
                shouldInlinePathParameters: true,
                service: createHttpService({ pathParameters: [servicePathParam] }),
                endpoint: createHttpEndpoint({
                    pathParameters: [endpointPathParam],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext({
                shouldInlinePathParameters: true
            });

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("does not include path parameters when shouldInlinePathParameters is false", () => {
            const init = createDefaultInit({
                shouldInlinePathParameters: false,
                endpoint: createHttpEndpoint({
                    pathParameters: [createPathParameter("plantId")],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext({
                shouldInlinePathParameters: false
            });

            wrapper.writeToFile(context);
            // Interface should be empty - no path params inlined
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with inlined request body properties", () => {
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("name", STRING_TYPE),
                    createInlinedRequestBodyProperty("species", STRING_TYPE),
                    createInlinedRequestBodyProperty("waterFrequency", OPTIONAL_INT_TYPE)
                ]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with inlined request body and extraProperties", () => {
            const body = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", STRING_TYPE)],
                extraProperties: true
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            // Should have [key: string]: any index signature
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with referenced request body", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        docs: "The plant description",
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with file upload and inlineFileProperties=true (Node18)", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [
                    createFileProperty("document"),
                    createBodyPropertyForUpload("description", OPTIONAL_STRING_TYPE)
                ]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                formDataSupport: "Node18",
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with file upload and inlineFileProperties=true (Node16)", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("photo"), createBodyPropertyForUpload("caption", STRING_TYPE)]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                formDataSupport: "Node16",
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            // Should have File | fs.ReadStream | Blob union for file property
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with file upload and inlineFileProperties=false", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("image"), createBodyPropertyForUpload("altText", STRING_TYPE)]
            });
            const init = createDefaultInit({
                inlineFileProperties: false,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            // File property should NOT appear, only body property
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with file array property", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [
                    createFileProperty("photos", { type: "fileArray" }),
                    createBodyPropertyForUpload("albumName", STRING_TYPE)
                ]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                formDataSupport: "Node18",
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            // File property should be Uploadable[] (array)
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with optional file property", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [
                    createFileProperty("thumbnail", { isOptional: true }),
                    createBodyPropertyForUpload("title", STRING_TYPE)
                ]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                formDataSupport: "Node18",
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            // File property should include | undefined and hasQuestionToken
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with all property sources combined", () => {
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("name", STRING_TYPE),
                    createInlinedRequestBodyProperty("sunlightHours", OPTIONAL_INT_TYPE)
                ]
            });
            const servicePathParam = createPathParameter("gardenId", "ROOT");
            const endpointPathParam = createPathParameter("plantId", "ENDPOINT");
            const init = createDefaultInit({
                shouldInlinePathParameters: true,
                service: createHttpService({
                    pathParameters: [servicePathParam],
                    headers: [createHttpHeader("xTenantId", STRING_TYPE, { wireValue: "X-Tenant-Id" })]
                }),
                endpoint: createHttpEndpoint({
                    pathParameters: [endpointPathParam],
                    queryParameters: [
                        createQueryParameter("page", OPTIONAL_INT_TYPE),
                        createQueryParameter("limit", OPTIONAL_INT_TYPE)
                    ],
                    headers: [createHttpHeader("xRequestId", OPTIONAL_STRING_TYPE, { wireValue: "X-Request-Id" })],
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext({
                shouldInlinePathParameters: true
            });

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface with query parameter docs", () => {
            const qp = createQueryParameter("cursor", OPTIONAL_STRING_TYPE);
            qp.docs = "The cursor for pagination";
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [qp],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });
    });

    // ── Property naming ────────────────────────────────────────────────

    describe("property naming", () => {
        it("uses camelCase names with includeSerdeLayer=true, retainOriginalCasing=false (default)", () => {
            const init = createDefaultInit({
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                parameterNaming: "default",
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("plantName", STRING_TYPE, { wireValue: "plant_name" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("uses wire values with includeSerdeLayer=false", () => {
            const init = createDefaultInit({
                includeSerdeLayer: false,
                retainOriginalCasing: false,
                parameterNaming: "default",
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("plantName", STRING_TYPE, { wireValue: "plant_name" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("uses wire values with retainOriginalCasing=true", () => {
            const init = createDefaultInit({
                includeSerdeLayer: true,
                retainOriginalCasing: true,
                parameterNaming: "default",
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("plantName", STRING_TYPE, { wireValue: "plant_name" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("uses wireValue parameterNaming mode", () => {
            const init = createDefaultInit({
                parameterNaming: "wireValue",
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("plantName", STRING_TYPE, { wireValue: "plant_name" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("uses camelCase parameterNaming mode", () => {
            const init = createDefaultInit({
                parameterNaming: "camelCase",
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("plantName", STRING_TYPE, { wireValue: "plant_name" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("uses snakeCase parameterNaming mode", () => {
            const init = createDefaultInit({
                parameterNaming: "snakeCase",
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("plantName", STRING_TYPE, { wireValue: "plant_name" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("uses originalName parameterNaming mode", () => {
            const init = createDefaultInit({
                parameterNaming: "originalName",
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("plantName", STRING_TYPE, { wireValue: "plant_name" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("uses camelCase for inlined body properties with includeSerdeLayer=true", () => {
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("waterFrequency", STRING_TYPE, {
                        wireValue: "water_frequency"
                    })
                ]
            });
            const init = createDefaultInit({
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("uses wire values for inlined body properties with includeSerdeLayer=false", () => {
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("waterFrequency", STRING_TYPE, {
                        wireValue: "water_frequency"
                    })
                ]
            });
            const init = createDefaultInit({
                includeSerdeLayer: false,
                retainOriginalCasing: false,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("applies naming to headers", () => {
            const init = createDefaultInit({
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                parameterNaming: "default",
                endpoint: createHttpEndpoint({
                    headers: [createHttpHeader("xApiVersion", STRING_TYPE, { wireValue: "X-API-Version" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("applies naming to path parameters when inlined", () => {
            const init = createDefaultInit({
                shouldInlinePathParameters: true,
                includeSerdeLayer: true,
                retainOriginalCasing: false,
                parameterNaming: "default",
                endpoint: createHttpEndpoint({
                    pathParameters: [createPathParameter("plantId")],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext({
                shouldInlinePathParameters: true
            });

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });
    });

    // ── Referenced body property name ──────────────────────────────────

    describe("getReferencedBodyPropertyName", () => {
        it("returns camelCase body key when retainOriginalCasing=false", () => {
            const init = createDefaultInit({
                retainOriginalCasing: false,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        docs: undefined,
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper({ bodyKey: "requestBody" })
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const name = wrapper.getReferencedBodyPropertyName();
            expect(name).toMatchSnapshot();
        });

        it("returns originalName body key when retainOriginalCasing=true", () => {
            const init = createDefaultInit({
                retainOriginalCasing: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        docs: undefined,
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper({ bodyKey: "requestBody" })
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const name = wrapper.getReferencedBodyPropertyName();
            expect(name).toMatchSnapshot();
        });
    });

    // ── areBodyPropertiesInlined ───────────────────────────────────────

    describe("areBodyPropertiesInlined", () => {
        it("returns true for inlinedRequestBody", () => {
            const body = createInlinedRequestBody({ properties: [] });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            expect(wrapper.areBodyPropertiesInlined()).toBe(true);
        });

        it("returns true for referenced body when flattenRequestParameters=true", () => {
            const init = createDefaultInit({
                flattenRequestParameters: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        docs: undefined,
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            expect(wrapper.areBodyPropertiesInlined()).toBe(true);
        });

        it("returns false for referenced body when flattenRequestParameters=false", () => {
            const init = createDefaultInit({
                flattenRequestParameters: false,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        docs: undefined,
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            expect(wrapper.areBodyPropertiesInlined()).toBe(false);
        });

        it("returns false when no request body", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            expect(wrapper.areBodyPropertiesInlined()).toBe(false);
        });

        it("returns false for fileUpload body", () => {
            const fileBody = createFileUploadRequestBody({ properties: [] });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            expect(wrapper.areBodyPropertiesInlined()).toBe(false);
        });
    });

    // ── hasBodyProperty ────────────────────────────────────────────────

    describe("hasBodyProperty", () => {
        it("returns false when no request body", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(false);
        });

        it("returns false for inlinedRequestBody", () => {
            const body = createInlinedRequestBody({ properties: [] });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(false);
        });

        it("returns true for reference body with flattenRequestParameters=false", () => {
            const init = createDefaultInit({
                flattenRequestParameters: false,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        docs: undefined,
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(true);
        });

        it("returns false for reference body with flattenRequestParameters=true", () => {
            const init = createDefaultInit({
                flattenRequestParameters: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        docs: undefined,
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(false);
        });

        it("returns false for fileUpload body", () => {
            const fileBody = createFileUploadRequestBody({ properties: [] });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(false);
        });

        it("returns false for bytes body", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.bytes({
                        isOptional: false,
                        contentType: undefined,
                        v2Examples: undefined,
                        docs: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(false);
        });
    });

    // ── areAllPropertiesOptional ───────────────────────────────────────

    describe("areAllPropertiesOptional", () => {
        it("returns true when all query parameters are optional", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [
                        createQueryParameter("cursor", OPTIONAL_STRING_TYPE),
                        createQueryParameter("limit", OPTIONAL_INT_TYPE)
                    ],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when a query parameter is required", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [
                        createQueryParameter("plantId", STRING_TYPE),
                        createQueryParameter("limit", OPTIONAL_INT_TYPE)
                    ],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns true with no properties", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when a required header exists", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    headers: [createHttpHeader("xApiKey", STRING_TYPE, { wireValue: "X-API-Key" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns false when inlined body has required property", () => {
            const body = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", STRING_TYPE)]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns true when inlined body has all optional properties", () => {
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("nickname", OPTIONAL_STRING_TYPE),
                    createInlinedRequestBodyProperty("notes", OPTIONAL_STRING_TYPE)
                ]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when referenced body is required", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        docs: undefined,
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns true when referenced body is optional", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: OPTIONAL_STRING_TYPE,
                        docs: undefined,
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when file upload has required file with inlineFileProperties", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("document")]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns true when file upload has optional file with inlineFileProperties", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("thumbnail", { isOptional: true })]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns true when file upload has required file but inlineFileProperties=false", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("document")]
            });
            const init = createDefaultInit({
                inlineFileProperties: false,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            // File is required but inlineFileProperties=false, so the file property visitor returns false for isRequired
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("caches the result of areAllPropertiesOptional", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("plantId", STRING_TYPE)],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const first = wrapper.areAllPropertiesOptional(context);
            const second = wrapper.areAllPropertiesOptional(context);
            expect(first).toBe(second);
            expect(first).toBe(false);
        });
    });

    // ── withQueryParameter ─────────────────────────────────────────────

    describe("withQueryParameter", () => {
        const dummySetter = (ref: ts.Expression) => [
            ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(ts.factory.createIdentifier("_setParam"), undefined, [ref])
            )
        ];

        const dummyItemSetter = (ref: ts.Expression) => [
            ts.factory.createExpressionStatement(
                ts.factory.createCallExpression(ts.factory.createIdentifier("_setItemParam"), undefined, [ref])
            )
        ];

        it("generates direct setter for required non-nullable query param", () => {
            const qp = createQueryParameter("plantId", STRING_TYPE);
            const init = createDefaultInit();
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();

            const result = wrapper.withQueryParameter({
                queryParameter: qp,
                referenceToQueryParameterProperty: ts.factory.createIdentifier("request.plantId"),
                context,
                queryParamSetter: dummySetter,
                queryParamItemSetter: dummyItemSetter
            });
            expect(serializeStatements(result)).toMatchSnapshot();
        });

        it("wraps in != null check for optional query param", () => {
            const qp = createQueryParameter("cursor", OPTIONAL_STRING_TYPE);
            const init = createDefaultInit();
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                isOptionalFn: (typeRef) => typeRef.type === "container" && typeRef.container.type === "optional"
            });

            const result = wrapper.withQueryParameter({
                queryParameter: qp,
                referenceToQueryParameterProperty: ts.factory.createIdentifier("request.cursor"),
                context,
                queryParamSetter: dummySetter,
                queryParamItemSetter: dummyItemSetter
            });
            expect(serializeStatements(result)).toMatchSnapshot();
        });

        it("wraps in !== undefined check for nullable query param", () => {
            const qp = createQueryParameter("filter", STRING_TYPE);
            const init = createDefaultInit();
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                isNullableFn: () => true,
                isOptionalFn: () => false
            });

            const result = wrapper.withQueryParameter({
                queryParameter: qp,
                referenceToQueryParameterProperty: ts.factory.createIdentifier("request.filter"),
                context,
                queryParamSetter: dummySetter,
                queryParamItemSetter: dummyItemSetter
            });
            expect(serializeStatements(result)).toMatchSnapshot();
        });

        it("generates Array.isArray check for allowMultiple query param", () => {
            const qp = createQueryParameter("tags", STRING_TYPE, { allowMultiple: true });
            const init = createDefaultInit();
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();

            const result = wrapper.withQueryParameter({
                queryParameter: qp,
                referenceToQueryParameterProperty: ts.factory.createIdentifier("request.tags"),
                context,
                queryParamSetter: dummySetter,
                queryParamItemSetter: dummyItemSetter
            });
            expect(serializeStatements(result)).toMatchSnapshot();
        });

        it("generates Array.isArray + optional check for allowMultiple optional query param", () => {
            const qp = createQueryParameter("categories", OPTIONAL_STRING_TYPE, { allowMultiple: true });
            const init = createDefaultInit();
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                isOptionalFn: (typeRef) => typeRef.type === "container" && typeRef.container.type === "optional"
            });

            const result = wrapper.withQueryParameter({
                queryParameter: qp,
                referenceToQueryParameterProperty: ts.factory.createIdentifier("request.categories"),
                context,
                queryParamSetter: dummySetter,
                queryParamItemSetter: dummyItemSetter
            });
            expect(serializeStatements(result)).toMatchSnapshot();
        });
    });

    // ── getRequestProperties ───────────────────────────────────────────

    describe("getRequestProperties", () => {
        it("returns empty array when no properties", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            expect(properties).toHaveLength(0);
        });

        it("returns properties for query parameters", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [
                        createQueryParameter("cursor", OPTIONAL_STRING_TYPE),
                        createQueryParameter("limit", INTEGER_TYPE)
                    ],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            expect(properties).toHaveLength(2);
            expect(properties[0]?.isOptional).toBe(true);
            expect(properties[1]?.isOptional).toBe(false);
        });

        it("returns properties for inlined body", () => {
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("name", STRING_TYPE),
                    createInlinedRequestBodyProperty("description", OPTIONAL_STRING_TYPE)
                ]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            expect(properties).toHaveLength(2);
        });

        it("returns single body property for referenced body when not flattened", () => {
            const init = createDefaultInit({
                flattenRequestParameters: false,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        docs: "Plant data",
                        contentType: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            expect(properties).toHaveLength(1);
            expect(properties[0]?.docs).toEqual(["Plant data"]);
        });

        it("filters out literal-typed properties from inlined body", () => {
            const literalType = FernIr.TypeReference.container(
                FernIr.ContainerType.literal(FernIr.Literal.string("fixed"))
            );
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("name", STRING_TYPE),
                    createInlinedRequestBodyProperty("version", literalType)
                ]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            // Only "name" should appear, "version" is literal and filtered
            expect(properties).toHaveLength(1);
        });

        it("includes file properties when inlineFileProperties=true", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("document"), createBodyPropertyForUpload("title", STRING_TYPE)]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            // file property + body property
            expect(properties).toHaveLength(2);
        });

        it("excludes file properties when inlineFileProperties=false", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("document"), createBodyPropertyForUpload("title", STRING_TYPE)]
            });
            const init = createDefaultInit({
                inlineFileProperties: false,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            // only body property, no file property
            expect(properties).toHaveLength(1);
        });

        it("marks properties as optional when hasDefaultValue is true and useDefaultRequestParameterValues is set", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("pageSize", INTEGER_TYPE)],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                hasDefaultValueFn: () => true,
                useDefaultRequestParameterValues: true
            });
            const properties = wrapper.getRequestProperties(context);
            expect(properties).toHaveLength(1);
            expect(properties[0]?.isOptional).toBe(true);
        });

        it("does not mark properties as optional when hasDefaultValue is true but useDefaultRequestParameterValues is false", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("pageSize", INTEGER_TYPE)],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                hasDefaultValueFn: () => true,
                useDefaultRequestParameterValues: false
            });
            const properties = wrapper.getRequestProperties(context);
            expect(properties).toHaveLength(1);
            expect(properties[0]?.isOptional).toBe(false);
        });

        it("creates union type for allowMultiple query parameter", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("tags", STRING_TYPE, { allowMultiple: true })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            assert(properties[0] != null, "Expected at least one property");
            const typeText = getTextOfTsNode(properties[0].type);
            // Should be "string | string[]"
            expect(typeText).toMatchSnapshot();
        });
    });

    // ── getNonBodyKeys ─────────────────────────────────────────────────

    describe("getNonBodyKeys", () => {
        it("returns query parameter and header keys", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("plantId", STRING_TYPE)],
                    headers: [createHttpHeader("xToken", STRING_TYPE, { wireValue: "X-Token" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const keys = wrapper.getNonBodyKeys(context);
            expect(keys).toHaveLength(2);
        });

        it("includes file property keys when inlineFileProperties=true", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("photo")]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("name", STRING_TYPE)],
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const keys = wrapper.getNonBodyKeys(context);
            // file key + query key
            expect(keys).toHaveLength(2);
        });

        it("excludes file property keys when inlineFileProperties=false", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("photo")]
            });
            const init = createDefaultInit({
                inlineFileProperties: false,
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("name", STRING_TYPE)],
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const keys = wrapper.getNonBodyKeys(context);
            // only query key
            expect(keys).toHaveLength(1);
        });

        it("includes inlined path parameter keys", () => {
            const init = createDefaultInit({
                shouldInlinePathParameters: true,
                endpoint: createHttpEndpoint({
                    pathParameters: [createPathParameter("plantId")],
                    queryParameters: [createQueryParameter("name", STRING_TYPE)],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({ shouldInlinePathParameters: true });
            const keys = wrapper.getNonBodyKeys(context);
            // path key + query key
            expect(keys).toHaveLength(2);
        });
    });

    // ── shouldInlinePathParameters ─────────────────────────────────────

    describe("shouldInlinePathParameters", () => {
        it("returns true when context says to inline", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({ shouldInlinePathParameters: true });
            expect(wrapper.shouldInlinePathParameters(context)).toBe(true);
        });

        it("returns false when context says not to inline", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({ shouldInlinePathParameters: false });
            expect(wrapper.shouldInlinePathParameters(context)).toBe(false);
        });
    });

    // ── getAllFileUploadProperties ──────────────────────────────────────

    describe("getAllFileUploadProperties", () => {
        it("returns empty array when no file upload body", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            expect(wrapper.getAllFileUploadProperties()).toHaveLength(0);
        });

        it("returns file properties from file upload body", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [
                    createFileProperty("document"),
                    createFileProperty("thumbnail"),
                    createBodyPropertyForUpload("title", STRING_TYPE)
                ]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            // Only file properties, not body properties
            expect(wrapper.getAllFileUploadProperties()).toHaveLength(2);
        });
    });

    // ── getAllQueryParameters / getAllPathParameters ─────────────────────

    describe("getAllQueryParameters", () => {
        it("returns endpoint query parameters", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("a", STRING_TYPE), createQueryParameter("b", INTEGER_TYPE)],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            expect(wrapper.getAllQueryParameters()).toHaveLength(2);
        });
    });

    describe("getAllPathParameters", () => {
        it("returns all path parameters from endpoint", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    pathParameters: [createPathParameter("gardenId"), createPathParameter("plantId")],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            expect(wrapper.getAllPathParameters()).toHaveLength(2);
        });
    });

    // ── Coverage gap tests ──────────────────────────────────────────────

    describe("writeToFile - inlinedRequestBody.extends", () => {
        it("generates interface that extends named types from inlined body", () => {
            const baseTypeName = createDeclaredTypeName("BaseParams");
            const body = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", STRING_TYPE)],
                extends: [baseTypeName]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("generates interface extending multiple named types", () => {
            const baseType1 = createDeclaredTypeName("BaseParams");
            const baseType2 = createDeclaredTypeName("PaginationParams");
            const body = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("query", STRING_TYPE)],
                extends: [baseType1, baseType2]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext();

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });
    });

    describe("writeToFile - enableInlineTypes", () => {
        it("generates namespace module for inline named type properties", () => {
            const namedTypeRef = createNamedTypeReference("InlineColor");
            const body = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("color", namedTypeRef)]
            });
            const init = createDefaultInit({
                enableInlineTypes: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });

            // Mock getTypeDeclaration to return an inline type declaration
            const inlineTypeDeclaration: FernIr.TypeDeclaration = {
                name: createDeclaredTypeName("InlineColor"),
                shape: FernIr.Type.object({
                    properties: [createObjectProperty("value", STRING_TYPE)],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set(),
                encoding: undefined,
                source: undefined,
                inline: true,
                docs: undefined,
                availability: undefined
            };

            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext({
                enableInlineTypes: true,
                getTypeDeclarationFn: () => inlineTypeDeclaration
            });

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("does not generate namespace module when no inline properties exist", () => {
            const body = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", STRING_TYPE)]
            });
            const init = createDefaultInit({
                enableInlineTypes: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });

            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext({ enableInlineTypes: true });

            wrapper.writeToFile(context);
            // Primitive properties are not inline — no namespace module should be generated
            expect(sourceFile.getText()).toMatchSnapshot();
        });
    });

    describe("writeToFile - flattenRequestParameters with named reference body", () => {
        it("flattens named body properties into wrapper interface", () => {
            const namedBodyRef = createNamedTypeReference("UserPayload");
            const init = createDefaultInit({
                flattenRequestParameters: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: namedBodyRef,
                        contentType: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });

            // Mock getTypeDeclaration to return an object type with properties
            const bodyTypeDeclaration: FernIr.TypeDeclaration = {
                name: createDeclaredTypeName("UserPayload"),
                shape: FernIr.Type.object({
                    properties: [createObjectProperty("email", STRING_TYPE), createObjectProperty("age", INTEGER_TYPE)],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set(),
                encoding: undefined,
                source: undefined,
                inline: undefined,
                docs: undefined,
                availability: undefined
            };

            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext({
                getTypeDeclarationFn: () => bodyTypeDeclaration
            });

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });

        it("flattens named body with optional properties into wrapper", () => {
            const namedBodyRef = createNamedTypeReference("UpdatePayload");
            const init = createDefaultInit({
                flattenRequestParameters: true,
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("dryRun", OPTIONAL_STRING_TYPE)],
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: namedBodyRef,
                        contentType: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });

            const bodyTypeDeclaration: FernIr.TypeDeclaration = {
                name: createDeclaredTypeName("UpdatePayload"),
                shape: FernIr.Type.object({
                    properties: [
                        createObjectProperty("name", OPTIONAL_STRING_TYPE),
                        createObjectProperty("description", OPTIONAL_STRING_TYPE)
                    ],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set(),
                encoding: undefined,
                source: undefined,
                inline: undefined,
                docs: undefined,
                availability: undefined
            };

            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext({
                getTypeDeclarationFn: () => bodyTypeDeclaration
            });

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });
    });

    // ── getNonBodyKeysWithData ─────────────────────────────────────────

    describe("getNonBodyKeysWithData", () => {
        it("returns query and header keys with original parameter data", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("cursor", STRING_TYPE)],
                    headers: [createHttpHeader("xToken", STRING_TYPE, { wireValue: "X-Token" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const keys = wrapper.getNonBodyKeysWithData(context);
            expect(keys).toHaveLength(2);
            expect(keys[0]?.originalParameter?.type).toBe("query");
            expect(keys[1]?.originalParameter?.type).toBe("header");
        });

        it("includes path parameter keys when shouldInlinePathParameters=true", () => {
            const init = createDefaultInit({
                shouldInlinePathParameters: true,
                endpoint: createHttpEndpoint({
                    pathParameters: [createPathParameter("gardenId")],
                    queryParameters: [createQueryParameter("name", STRING_TYPE)],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({ shouldInlinePathParameters: true });
            const keys = wrapper.getNonBodyKeysWithData(context);
            expect(keys).toHaveLength(2);
            expect(keys[0]?.originalParameter?.type).toBe("path");
            expect(keys[1]?.originalParameter?.type).toBe("query");
        });

        it("includes file property keys when inlineFileProperties=true", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("photo"), createBodyPropertyForUpload("title", STRING_TYPE)]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("name", STRING_TYPE)],
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const keys = wrapper.getNonBodyKeysWithData(context);
            // file key + query key
            expect(keys).toHaveLength(2);
            expect(keys[0]?.originalParameter?.type).toBe("file");
            expect(keys[1]?.originalParameter?.type).toBe("query");
        });

        it("excludes file property keys when inlineFileProperties=false", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("photo")]
            });
            const init = createDefaultInit({
                inlineFileProperties: false,
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("name", STRING_TYPE)],
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const keys = wrapper.getNonBodyKeysWithData(context);
            expect(keys).toHaveLength(1);
            expect(keys[0]?.originalParameter?.type).toBe("query");
        });
    });

    // ── areAllPropertiesOptional ───────────────────────────────────────

    describe("areAllPropertiesOptional", () => {
        it("returns true when no properties exist", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when required query parameter exists", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("name", STRING_TYPE)],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns true when all query parameters are optional", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [
                        createQueryParameter("cursor", OPTIONAL_STRING_TYPE),
                        createQueryParameter("limit", OPTIONAL_INT_TYPE)
                    ],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when required header exists", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("cursor", OPTIONAL_STRING_TYPE)],
                    headers: [createHttpHeader("xAuth", STRING_TYPE, { wireValue: "X-Auth" })],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns false when required path parameter exists with shouldInlinePathParameters", () => {
            const init = createDefaultInit({
                shouldInlinePathParameters: true,
                endpoint: createHttpEndpoint({
                    pathParameters: [createPathParameter("plantId")],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({ shouldInlinePathParameters: true });
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns true when reference body type is optional", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: OPTIONAL_STRING_TYPE,
                        contentType: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when reference body type is required", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        contentType: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns true when all inlined body properties are optional", () => {
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("name", OPTIONAL_STRING_TYPE),
                    createInlinedRequestBodyProperty("age", OPTIONAL_INT_TYPE)
                ]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when any inlined body property is required", () => {
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("name", STRING_TYPE),
                    createInlinedRequestBodyProperty("age", OPTIONAL_INT_TYPE)
                ]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("checks extended type properties for inlined body", () => {
            const baseTypeName = createDeclaredTypeName("BaseParams");
            const body = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", OPTIONAL_STRING_TYPE)],
                extends: [baseTypeName]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                getGeneratedTypeFn: () => ({
                    type: "object",
                    getAllPropertiesIncludingExtensions: () => [{ type: STRING_TYPE }]
                })
            });
            // BaseParams has a required property so should be false
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns true when extended type properties are all optional", () => {
            const baseTypeName = createDeclaredTypeName("BaseParams");
            const body = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", OPTIONAL_STRING_TYPE)],
                extends: [baseTypeName]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                getGeneratedTypeFn: () => ({
                    type: "object",
                    getAllPropertiesIncludingExtensions: () => [{ type: OPTIONAL_STRING_TYPE }]
                })
            });
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("resolves alias extensions before checking properties", () => {
            const aliasTypeName = createDeclaredTypeName("AliasedBase");
            const body = createInlinedRequestBody({
                properties: [],
                extends: [aliasTypeName]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const realTypeName = createDeclaredTypeName("RealBase");
            const namedRef = createNamedTypeReference("RealBase");
            const { context } = createMockContext({
                getTypeDeclarationFn: () =>
                    ({
                        shape: FernIr.Type.alias({
                            aliasOf: namedRef,
                            resolvedType: FernIr.ResolvedTypeReference.named({
                                name: realTypeName,
                                shape: "OBJECT" as FernIr.ShapeType
                            })
                        })
                        // biome-ignore lint/suspicious/noExplicitAny: test mock
                    }) as any,
                getGeneratedTypeFn: () => ({
                    type: "object",
                    getAllPropertiesIncludingExtensions: () => [{ type: STRING_TYPE }]
                })
            });
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("returns true when file upload has all optional file and body properties", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [
                    createFileProperty("photo", { isOptional: true }),
                    createBodyPropertyForUpload("caption", OPTIONAL_STRING_TYPE)
                ]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when file upload has required file property", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("photo"), createBodyPropertyForUpload("caption", OPTIONAL_STRING_TYPE)]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("ignores file properties when inlineFileProperties=false", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("photo"), createBodyPropertyForUpload("caption", OPTIONAL_STRING_TYPE)]
            });
            const init = createDefaultInit({
                inlineFileProperties: false,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            // Required file property ignored because inlineFileProperties=false
            // Only body property (optional caption) is checked
            expect(wrapper.areAllPropertiesOptional(context)).toBe(true);
        });

        it("returns false when file upload has required body property", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [
                    createFileProperty("photo", { isOptional: true }),
                    createBodyPropertyForUpload("title", STRING_TYPE)
                ]
            });
            const init = createDefaultInit({
                inlineFileProperties: true,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.areAllPropertiesOptional(context)).toBe(false);
        });

        it("caches result across multiple calls", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    queryParameters: [createQueryParameter("cursor", OPTIONAL_STRING_TYPE)],
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const first = wrapper.areAllPropertiesOptional(context);
            const second = wrapper.areAllPropertiesOptional(context);
            expect(first).toBe(true);
            expect(second).toBe(true);
        });
    });

    // ── getRequestProperties with flattenRequestParameters ─────────────

    describe("getRequestProperties - flattenRequestParameters", () => {
        it("flattens inlined body properties via getRequestProperties", () => {
            const body = createInlinedRequestBody({
                properties: [
                    createInlinedRequestBodyProperty("name", STRING_TYPE),
                    createInlinedRequestBodyProperty("email", OPTIONAL_STRING_TYPE)
                ]
            });
            const init = createDefaultInit({
                flattenRequestParameters: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            expect(properties).toHaveLength(2);
            expect(properties[0]?.isOptional).toBe(false);
            expect(properties[1]?.isOptional).toBe(true);
        });

        it("flattens referenced named body properties via getRequestProperties", () => {
            const namedBodyRef = createNamedTypeReference("UserPayload");
            const init = createDefaultInit({
                flattenRequestParameters: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: namedBodyRef,
                        contentType: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const bodyTypeDeclaration: FernIr.TypeDeclaration = {
                name: createDeclaredTypeName("UserPayload"),
                shape: FernIr.Type.object({
                    properties: [createObjectProperty("email", STRING_TYPE), createObjectProperty("age", INTEGER_TYPE)],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set(),
                encoding: undefined,
                source: undefined,
                inline: undefined,
                docs: undefined,
                availability: undefined
            };
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                getTypeDeclarationFn: () => bodyTypeDeclaration
            });
            const properties = wrapper.getRequestProperties(context);
            expect(properties).toHaveLength(2);
        });

        it("falls back to single body property for non-named referenced type when flattened", () => {
            const init = createDefaultInit({
                flattenRequestParameters: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        contentType: undefined,
                        docs: "The raw body",
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            const properties = wrapper.getRequestProperties(context);
            // Non-named type can't be flattened, falls back to single body property
            expect(properties).toHaveLength(1);
            expect(properties[0]?.docs).toEqual(["The raw body"]);
        });

        it("returns empty for non-object type declaration when flattened", () => {
            const namedBodyRef = createNamedTypeReference("AliasPayload");
            const init = createDefaultInit({
                flattenRequestParameters: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: namedBodyRef,
                        contentType: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const aliasTypeDeclaration: FernIr.TypeDeclaration = {
                name: createDeclaredTypeName("AliasPayload"),
                shape: FernIr.Type.alias({
                    aliasOf: STRING_TYPE,
                    resolvedType: FernIr.ResolvedTypeReference.primitive({
                        v1: "STRING",
                        v2: undefined
                    })
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set(),
                encoding: undefined,
                source: undefined,
                inline: undefined,
                docs: undefined,
                availability: undefined
            };
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                getTypeDeclarationFn: () => aliasTypeDeclaration
            });
            const properties = wrapper.getRequestProperties(context);
            // Alias type can't be flattened into properties
            expect(properties).toHaveLength(0);
        });

        it("uses enableInlineTypes createNamespacedPropertyType when flattening named reference body", () => {
            const namedBodyRef = createNamedTypeReference("InlinePayload");
            const init = createDefaultInit({
                flattenRequestParameters: true,
                enableInlineTypes: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: namedBodyRef,
                        contentType: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const bodyTypeDeclaration: FernIr.TypeDeclaration = {
                name: createDeclaredTypeName("InlinePayload"),
                shape: FernIr.Type.object({
                    properties: [createObjectProperty("color", STRING_TYPE)],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set(),
                encoding: undefined,
                source: undefined,
                inline: undefined,
                docs: undefined,
                availability: undefined
            };
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext({
                enableInlineTypes: true,
                getTypeDeclarationFn: () => bodyTypeDeclaration
            });
            const properties = wrapper.getRequestProperties(context);
            expect(properties).toHaveLength(1);
        });
    });

    // ── writeToFile - enableInlineTypes with fileUpload body ───────────

    describe("writeToFile - enableInlineTypes with fileUpload body", () => {
        it("generates namespace module for file upload body with inline named properties", () => {
            const namedTypeRef = createNamedTypeReference("UploadMeta");
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("document"), createBodyPropertyForUpload("metadata", namedTypeRef)]
            });
            const init = createDefaultInit({
                enableInlineTypes: true,
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });

            const inlineTypeDeclaration: FernIr.TypeDeclaration = {
                name: createDeclaredTypeName("UploadMeta"),
                shape: FernIr.Type.object({
                    properties: [createObjectProperty("format", STRING_TYPE)],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                }),
                autogeneratedExamples: [],
                userProvidedExamples: [],
                v2Examples: undefined,
                referencedTypes: new Set(),
                encoding: undefined,
                source: undefined,
                inline: true,
                docs: undefined,
                availability: undefined
            };

            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context, sourceFile } = createMockContext({
                enableInlineTypes: true,
                getTypeDeclarationFn: () => inlineTypeDeclaration
            });

            wrapper.writeToFile(context);
            expect(sourceFile.getText()).toMatchSnapshot();
        });
    });

    // ── hasBodyProperty ───────────────────────────────────────────────

    describe("hasBodyProperty", () => {
        it("returns false for inlined request body", () => {
            const body = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", STRING_TYPE)]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(body),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(false);
        });

        it("returns true for reference request body when not flattened", () => {
            const init = createDefaultInit({
                flattenRequestParameters: false,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        contentType: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(true);
        });

        it("returns false for reference request body when flattened", () => {
            const init = createDefaultInit({
                flattenRequestParameters: true,
                endpoint: createHttpEndpoint({
                    requestBody: FernIr.HttpRequestBody.reference({
                        requestBodyType: STRING_TYPE,
                        contentType: undefined,
                        docs: undefined,
                        v2Examples: undefined
                    }),
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(false);
        });

        it("returns false when no request body", () => {
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(false);
        });

        it("returns false for file upload body", () => {
            const fileBody = createFileUploadRequestBody({
                properties: [createFileProperty("doc")]
            });
            const init = createDefaultInit({
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                })
            });
            const wrapper = new GeneratedRequestWrapperImpl(init);
            const { context } = createMockContext();
            expect(wrapper.hasBodyProperty(context)).toBe(false);
        });
    });
});
