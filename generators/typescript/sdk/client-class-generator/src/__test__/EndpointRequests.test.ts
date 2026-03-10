import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    casingsGenerator,
    createHttpEndpoint,
    createHttpService,
    createInlinedRequestBody,
    createInlinedRequestBodyProperty,
    createMinimalIR,
    createNameAndWireValue,
    createPathParameter,
    createQueryParameter,
    createSdkRequestBody,
    createSdkRequestWrapper
} from "@fern-typescript/test-utils";
import assert from "assert";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedBytesEndpointRequest } from "../endpoint-request/GeneratedBytesEndpointRequest.js";
import { GeneratedDefaultEndpointRequest } from "../endpoint-request/GeneratedDefaultEndpointRequest.js";
import { GeneratedFileUploadEndpointRequest } from "../endpoint-request/GeneratedFileUploadEndpointRequest.js";

const STRING_TYPE = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
const OPTIONAL_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.optional(STRING_TYPE));
const INTEGER_TYPE = FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined });

/**
 * Helper to serialize ts.Statement[] to a readable string for snapshot comparison.
 */
function serializeStatements(statements: ts.Statement[]): string {
    return statements.map((s) => getTextOfTsNode(s)).join("\n");
}

/**
 * Creates a mock SdkContext for endpoint request tests.
 * This is more comprehensive than the basic mock contexts because endpoint requests
 * exercise many more context properties (requestWrapper, sdkInlinedRequestBodySchema, etc.).
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock needs to satisfy complex SdkContext interface
function createEndpointRequestMockContext(opts?: { shouldInlinePathParams?: boolean }): any {
    const context = {
        includeSerdeLayer: true,
        retainOriginalCasing: false,
        inlineFileProperties: false,
        config: { customConfig: {} },
        type: {
            stringify: (
                expr: ts.Expression,
                _typeRef: FernIr.TypeReference,
                _opts?: { includeNullCheckIfOptional: boolean }
            ) => {
                return ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(expr, ts.factory.createIdentifier("toString")),
                    undefined,
                    []
                );
            },
            resolveTypeReference: (typeRef: FernIr.TypeReference) => typeRef,
            getTypeDeclaration: () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            }),
            getReferenceToType: (typeRef: FernIr.TypeReference) => {
                const isOptional =
                    typeRef.type === "container" &&
                    (typeRef.container.type === "optional" || typeRef.container.type === "nullable");
                let innerType = typeRef;
                if (typeRef.type === "container" && typeRef.container.type === "optional") {
                    innerType = typeRef.container.optional;
                }
                const typeText =
                    innerType.type === "primitive"
                        ? primitiveToTypeText(innerType.primitive.v1)
                        : innerType.type === "unknown"
                          ? "unknown"
                          : "SomeType";
                const typeNode = ts.factory.createTypeReferenceNode(typeText);
                return {
                    typeNode,
                    typeNodeWithoutUndefined: typeNode,
                    requestTypeNode: undefined,
                    requestTypeNodeWithoutUndefined: undefined,
                    isOptional
                };
            },
            getGeneratedExample: () => ({
                build: () => ts.factory.createStringLiteral("example")
            })
        },
        requestWrapper: {
            shouldInlinePathParameters: () => opts?.shouldInlinePathParams ?? false,
            getReferenceToRequestWrapper: () => ts.factory.createTypeReferenceNode("TestRequest"),
            getGeneratedRequestWrapper: () => createMockGeneratedRequestWrapper()
        },
        sdkInlinedRequestBodySchema: {
            getGeneratedInlinedRequestBodySchema: () => ({
                serializeRequest: (ref: ts.Expression) => {
                    return ts.factory.createCallExpression(
                        ts.factory.createIdentifier("serializers.TestRequest.jsonOrThrow"),
                        undefined,
                        [ref]
                    );
                }
            })
        },
        sdkEndpointTypeSchemas: {
            getGeneratedEndpointTypeSchemas: () => ({
                serializeRequest: (ref: ts.Expression) => {
                    return ts.factory.createCallExpression(
                        ts.factory.createIdentifier("serializers.testEndpoint.Request.jsonOrThrow"),
                        undefined,
                        [ref]
                    );
                }
            })
        },
        coreUtilities: {
            formDataUtils: {
                newFormData: () =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("core"), "newFormData"),
                        undefined,
                        []
                    ),
                appendFile: ({
                    key,
                    value
                }: {
                    referenceToFormData: ts.Expression;
                    key: string;
                    value: ts.Expression;
                }) =>
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("_body"),
                                "appendFile"
                            ),
                            undefined,
                            [ts.factory.createStringLiteral(key), value]
                        )
                    ),
                append: ({
                    key,
                    value
                }: {
                    referenceToFormData: ts.Expression;
                    key: string | ts.Expression;
                    value: ts.Expression;
                }) =>
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("_body"), "append"),
                            undefined,
                            [typeof key === "string" ? ts.factory.createStringLiteral(key) : key, value]
                        )
                    ),
                getRequest: ({ referenceToFormData }: { referenceToFormData: ts.Expression }) =>
                    ts.factory.createCallExpression(
                        ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier("core"),
                            "getFormDataRequest"
                        ),
                        undefined,
                        [referenceToFormData]
                    ),
                getBody: ({ referenceToFormData }: { referenceToFormData: ts.Expression }) =>
                    ts.factory.createPropertyAccessExpression(referenceToFormData, "body"),
                getHeaders: ({ referenceToFormData }: { referenceToFormData: ts.Expression }) =>
                    ts.factory.createPropertyAccessExpression(referenceToFormData, "headers"),
                getDuplexSetting: ({ referenceToFormData }: { referenceToFormData: ts.Expression }) =>
                    ts.factory.createPropertyAccessExpression(referenceToFormData, "duplex"),
                encodeAsFormParameter: ({ referenceToArgument }: { referenceToArgument: ts.Expression }) =>
                    ts.factory.createCallExpression(
                        ts.factory.createIdentifier("core.encodeAsFormParameter"),
                        undefined,
                        [referenceToArgument]
                    )
            },
            fileUtils: {
                Uploadable: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.Uploadable")
                },
                toBinaryUploadRequest: {
                    _invoke: (arg: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("core.toBinaryUploadRequest"),
                            undefined,
                            [arg]
                        )
                }
            },
            fetcher: {
                Fetcher: {
                    Args: {
                        _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.Fetcher.Args")
                    }
                }
            },
            auth: {
                AuthRequest: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.AuthRequest")
                },
                AuthProvider: {
                    getAuthRequest: {
                        invoke: () => ts.factory.createIdentifier("undefined")
                    }
                }
            }
        },
        externalDependencies: {
            fs: {
                ReadStream: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("fs.ReadStream")
                }
            },
            blob: {
                Blob: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("Blob")
                }
            }
        },
        importsManager: {
            addImport: () => {
                // no-op mock
            },
            addImportFromRoot: () => {
                // no-op mock
            }
        },
        jsonContext: {
            getReferenceToToJson: () => ({
                getExpression: () => ts.factory.createIdentifier("JSON.stringify")
            })
        },
        versionContext: {
            getGeneratedVersion: () => undefined
        },
        authProvider: {
            isAuthEndpoint: () => false
        }
    };
    return context;
}

function primitiveToTypeText(v1: string): string {
    switch (v1) {
        case "STRING":
            return "string";
        case "INTEGER":
            return "number";
        case "BOOLEAN":
            return "boolean";
        default:
            return "unknown";
    }
}

/**
 * Creates a mock GeneratedRequestWrapper for tests that use wrapper-mode requests.
 */
function createMockGeneratedRequestWrapper() {
    return {
        areAllPropertiesOptional: () => false,
        areBodyPropertiesInlined: () => true,
        hasBodyProperty: () => false,
        getNonBodyKeys: () => [],
        getNonBodyKeysWithData: () => [] as { propertyName: string; safeName: string; originalParameter: unknown }[],
        getAllQueryParameters: () => [] as FernIr.QueryParameter[],
        getAllPathParameters: () => [] as FernIr.PathParameter[],
        getReferencedBodyPropertyName: () => "body",
        getPropertyNameOfQueryParameter: (qp: FernIr.QueryParameter) => ({
            propertyName: qp.name.name.camelCase.unsafeName,
            safeName: qp.name.name.camelCase.unsafeName
        }),
        getPropertyNameOfPathParameter: (pp: FernIr.PathParameter) => ({
            propertyName: pp.name.camelCase.unsafeName,
            safeName: pp.name.camelCase.unsafeName
        }),
        getPropertyNameOfNonLiteralHeader: (h: FernIr.HttpHeader) => ({
            propertyName: h.name.name.camelCase.unsafeName,
            safeName: h.name.name.camelCase.unsafeName
        }),
        getInlinedRequestBodyPropertyKey: (p: FernIr.InlinedRequestBodyProperty) => ({
            propertyName: p.name.name.camelCase.unsafeName,
            safeName: p.name.name.camelCase.unsafeName
        }),
        generateExample: () => undefined,
        withQueryParameter: ({
            queryParamSetter,
            referenceToQueryParameterProperty
        }: {
            queryParameter: FernIr.QueryParameter;
            referenceToQueryParameterProperty: ts.Expression;
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            context: any;
            queryParamSetter: (ref: ts.Expression) => ts.Statement[];
            queryParamItemSetter: (ref: ts.Expression) => ts.Statement[];
        }) => queryParamSetter(referenceToQueryParameterProperty)
    };
}

/**
 * Creates a mock GeneratedSdkClientClassImpl for endpoint request tests.
 * Only needs to satisfy the generateHeaders call chain.
 */
// biome-ignore lint/suspicious/noExplicitAny: test mock
function createMockSdkClientClass(): any {
    return {
        hasAuthProvider: () => false,
        getGenerateEndpointMetadata: () => false,
        getReferenceToAuthProviderOrThrow: () => ts.factory.createIdentifier("this._authProvider"),
        getReferenceToMetadataForEndpointSupplier: () => ts.factory.createIdentifier("_metadata"),
        getEnvironment: () => undefined
    };
}

function createFileUploadRequestBody(opts?: {
    properties?: FernIr.FileUploadRequestProperty[];
}): FernIr.HttpRequestBody.FileUpload {
    return FernIr.HttpRequestBody.fileUpload({
        name: casingsGenerator.generateName("TestUpload"),
        properties: opts?.properties ?? [],
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

/**
 * Creates a bytes request body and matching SDK request for use in GeneratedBytesEndpointRequest tests.
 */
function createBytesRequestBodyAndSdkRequest(opts?: { isOptional?: boolean; contentType?: string }): {
    bytesBody: FernIr.HttpRequestBody.Bytes;
    sdkRequest: FernIr.SdkRequest;
} {
    const isOptional = opts?.isOptional ?? false;
    const contentType = opts?.contentType;
    const bytesBody = FernIr.HttpRequestBody.bytes({
        isOptional,
        contentType,
        v2Examples: undefined,
        docs: undefined
    });
    const sdkRequest: FernIr.SdkRequest = {
        streamParameter: undefined,
        requestParameterName: casingsGenerator.generateName("request"),
        shape: FernIr.SdkRequestShape.justRequestBody(
            FernIr.SdkRequestBodyType.bytes({
                isOptional,
                contentType,
                v2Examples: undefined,
                docs: undefined
            })
        )
    };
    return { bytesBody, sdkRequest };
}

/**
 * Creates a GeneratedBytesEndpointRequest instance for use in tests.
 */
function createBytesEndpointRequest(opts?: {
    isOptional?: boolean;
    contentType?: string;
    pathParameters?: FernIr.PathParameter[];
}): GeneratedBytesEndpointRequest {
    const { bytesBody, sdkRequest } = createBytesRequestBodyAndSdkRequest({
        isOptional: opts?.isOptional,
        contentType: opts?.contentType
    });
    return new GeneratedBytesEndpointRequest({
        ir: createMinimalIR(),
        packageId: { isRoot: true },
        service: createHttpService(),
        endpoint: createHttpEndpoint({
            pathParameters: opts?.pathParameters,
            allPathParameters: opts?.pathParameters,
            requestBody: bytesBody,
            sdkRequest
        }),
        requestBody: bytesBody,
        generatedSdkClientClass: createMockSdkClientClass(),
        retainOriginalCasing: false,
        parameterNaming: "default",
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        exportsManager: {} as any
    });
}

// ========================== Tests ==========================

describe("GeneratedDefaultEndpointRequest", () => {
    describe("getEndpointParameters", () => {
        it("returns empty parameters when no sdkRequest and no path params", () => {
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest: undefined,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                requestBody: undefined,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toEqual([]);
        });

        it("includes path parameters in signature", () => {
            const pathParam = createPathParameter("userId");
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest: undefined,
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    pathParameters: [pathParam],
                    allPathParameters: [pathParam]
                }),
                requestBody: undefined,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(1);
            expect(params[0]?.name).toBe("userId");
            expect(params[0]?.type).toBe("string");
        });

        it("includes request body parameter with justRequestBody sdkRequest", () => {
            const sdkRequest = createSdkRequestBody();
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest,
                service: createHttpService(),
                endpoint: createHttpEndpoint({ sdkRequest }),
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: STRING_TYPE,
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                }),
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(1);
            expect(params[0]?.name).toBe("request");
            expect(params[0]?.type).toBe("string");
        });

        it("includes wrapper parameter with wrapper sdkRequest", () => {
            const sdkRequest = createSdkRequestWrapper();
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest,
                service: createHttpService(),
                endpoint: createHttpEndpoint({ sdkRequest }),
                requestBody: FernIr.HttpRequestBody.inlinedRequestBody(createInlinedRequestBody()),
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(1);
            expect(params[0]?.name).toBe("request");
            expect(params[0]?.type).toBe("TestRequest");
        });

        it("excludes path params when shouldInlinePathParameters is true", () => {
            const pathParam = createPathParameter("userId");
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest: undefined,
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    pathParameters: [pathParam],
                    allPathParameters: [pathParam]
                }),
                requestBody: undefined,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext({ shouldInlinePathParams: true });
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(0);
        });

        it("includes both path params and body param", () => {
            const pathParam = createPathParameter("userId");
            const sdkRequest = createSdkRequestBody();
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest,
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    pathParameters: [pathParam],
                    allPathParameters: [pathParam],
                    sdkRequest
                }),
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: STRING_TYPE,
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                }),
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(2);
            expect(params[0]?.name).toBe("userId");
            expect(params[1]?.name).toBe("request");
        });
    });

    describe("getFetcherRequestArgs", () => {
        it("returns json content type for inlined request body", () => {
            const sdkRequest = createSdkRequestWrapper();
            const inlinedBody = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", STRING_TYPE)]
            });
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest,
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    sdkRequest,
                    requestBody: FernIr.HttpRequestBody.inlinedRequestBody(inlinedBody)
                }),
                requestBody: FernIr.HttpRequestBody.inlinedRequestBody(inlinedBody),
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            // Need to call getBuildRequestStatements first to initialize query params
            request.getBuildRequestStatements(context);
            const args = request.getFetcherRequestArgs(context);
            expect(args.contentType).toBe("application/json");
            expect(args.requestType).toBe("json");
        });

        it("returns json content type for reference request body", () => {
            const sdkRequest = createSdkRequestBody();
            const referenceBody = FernIr.HttpRequestBody.reference({
                requestBodyType: STRING_TYPE,
                contentType: undefined,
                docs: undefined,
                v2Examples: undefined
            });
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest,
                service: createHttpService(),
                endpoint: createHttpEndpoint({ sdkRequest, requestBody: referenceBody }),
                requestBody: referenceBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            request.getBuildRequestStatements(context);
            const args = request.getFetcherRequestArgs(context);
            expect(args.contentType).toBe("application/json");
            expect(args.requestType).toBe("json");
        });

        it("returns form request type for x-www-form-urlencoded content type", () => {
            const inlinedBody = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", STRING_TYPE)]
            });
            const httpBody = FernIr.HttpRequestBody.inlinedRequestBody({
                ...inlinedBody,
                contentType: "application/x-www-form-urlencoded"
            });
            const sdkRequest = createSdkRequestWrapper();
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest,
                service: createHttpService(),
                endpoint: createHttpEndpoint({ sdkRequest, requestBody: httpBody }),
                requestBody: httpBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            request.getBuildRequestStatements(context);
            const args = request.getFetcherRequestArgs(context);
            expect(args.requestType).toBe("form");
        });

        it("returns undefined content type and request type for no body", () => {
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest: undefined,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                requestBody: undefined,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            request.getBuildRequestStatements(context);
            const args = request.getFetcherRequestArgs(context);
            expect(args.contentType).toBeUndefined();
            expect(args.requestType).toBeUndefined();
            expect(args.body).toBeUndefined();
        });

        it("returns headers reference", () => {
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest: undefined,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                requestBody: undefined,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            request.getBuildRequestStatements(context);
            const args = request.getFetcherRequestArgs(context);
            assert(args.headers != null, "headers should not be null");
            expect(getTextOfTsNode(args.headers)).toBe("_headers");
        });
    });

    describe("getBuildRequestStatements", () => {
        it("generates header initialization for endpoint with no request body", () => {
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest: undefined,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                requestBody: undefined,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const statements = request.getBuildRequestStatements(context);
            const serialized = serializeStatements(statements);
            // Should contain header initialization
            expect(serialized).toContain("_headers");
        });

        it("generates wrapper destructuring for wrapper sdkRequest", () => {
            const sdkRequest = createSdkRequestWrapper();
            const queryParam = createQueryParameter("limit", INTEGER_TYPE);
            const inlinedBody = createInlinedRequestBody({
                properties: [createInlinedRequestBodyProperty("name", STRING_TYPE)]
            });
            const endpoint = createHttpEndpoint({
                sdkRequest,
                queryParameters: [queryParam],
                requestBody: FernIr.HttpRequestBody.inlinedRequestBody(inlinedBody)
            });

            // Mock that returns query parameters and non-body keys
            const mockRequestWrapper = createMockGeneratedRequestWrapper();
            mockRequestWrapper.getAllQueryParameters = () => [queryParam];
            mockRequestWrapper.getNonBodyKeysWithData = () => [
                { propertyName: "limit", safeName: "limit", originalParameter: null as unknown }
            ];
            mockRequestWrapper.areBodyPropertiesInlined = () => true;

            const context = createEndpointRequestMockContext();
            context.requestWrapper.getGeneratedRequestWrapper = () => mockRequestWrapper;

            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest,
                service: createHttpService(),
                endpoint,
                requestBody: FernIr.HttpRequestBody.inlinedRequestBody(inlinedBody),
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const statements = request.getBuildRequestStatements(context);
            const serialized = serializeStatements(statements);
            expect(serialized).toMatchSnapshot();
        });
    });

    describe("getExampleEndpointImports", () => {
        it("returns empty array", () => {
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest: undefined,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                requestBody: undefined,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            expect(request.getExampleEndpointImports()).toEqual([]);
        });
    });

    describe("getReferenceToRequestBody", () => {
        it("returns undefined when no request parameter", () => {
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest: undefined,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                requestBody: undefined,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            expect(request.getReferenceToRequestBody(context)).toBeUndefined();
        });

        it("returns identifier for body parameter (justRequestBody)", () => {
            const sdkRequest = createSdkRequestBody();
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest,
                service: createHttpService(),
                endpoint: createHttpEndpoint({ sdkRequest }),
                requestBody: FernIr.HttpRequestBody.reference({
                    requestBodyType: STRING_TYPE,
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                }),
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const ref = request.getReferenceToRequestBody(context);
            assert(ref != null, "reference should not be null");
            expect(getTextOfTsNode(ref)).toBe("request");
        });
    });

    describe("getReferenceToPathParameter", () => {
        it("throws when no request parameter", () => {
            const request = new GeneratedDefaultEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                sdkRequest: undefined,
                service: createHttpService(),
                endpoint: createHttpEndpoint(),
                requestBody: undefined,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            expect(() => request.getReferenceToPathParameter("userId", context)).toThrow();
        });
    });
});

describe("GeneratedFileUploadEndpointRequest", () => {
    describe("getEndpointParameters", () => {
        it("includes file parameters for Node18 (Uploadable)", () => {
            const fileProperty = createFileProperty("document");
            const fileBody = createFileUploadRequestBody({ properties: [fileProperty] });
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: false,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node18",
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(1);
            expect(params[0]?.name).toBe("document");
            expect(params[0]?.type).toContain("core.Uploadable");
        });

        it("includes file parameters for Node16 (File | ReadStream | Blob)", () => {
            const fileProperty = createFileProperty("document");
            const fileBody = createFileUploadRequestBody({ properties: [fileProperty] });
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: false,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node16",
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(1);
            const typeStr = params[0]?.type ?? "";
            expect(typeStr).toContain("File");
            expect(typeStr).toContain("fs.ReadStream");
            expect(typeStr).toContain("Blob");
        });

        it("includes file array parameter types", () => {
            const fileProperty = createFileProperty("documents", { type: "fileArray" });
            const fileBody = createFileUploadRequestBody({ properties: [fileProperty] });
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: false,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node18",
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(1);
            const typeStr = params[0]?.type ?? "";
            expect(typeStr).toContain("core.Uploadable[]");
        });

        it("includes optional file parameter with undefined union", () => {
            const fileProperty = createFileProperty("avatar", { isOptional: true });
            const fileBody = createFileUploadRequestBody({ properties: [fileProperty] });
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: false,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node18",
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(1);
            const typeStr = params[0]?.type ?? "";
            expect(typeStr).toContain("core.Uploadable");
            expect(typeStr).toContain("undefined");
        });

        it("hides file parameters when inlineFileProperties is true", () => {
            const fileProperty = createFileProperty("document");
            const bodyProperty = createBodyPropertyForUpload("description", STRING_TYPE);
            const fileBody = createFileUploadRequestBody({
                properties: [fileProperty, bodyProperty]
            });
            const sdkRequest = createSdkRequestWrapper();
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: true,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node18",
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            context.inlineFileProperties = true;
            const params = request.getEndpointParameters(context);
            // Should have wrapper param but no file params (files are in wrapper)
            expect(params).toHaveLength(1);
            expect(params[0]?.name).toBe("request");
        });

        it("includes path params and file params together", () => {
            const pathParam = createPathParameter("uploadId");
            const fileProperty = createFileProperty("file");
            const fileBody = createFileUploadRequestBody({ properties: [fileProperty] });
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService({ pathParameters: [] }),
                endpoint: createHttpEndpoint({
                    pathParameters: [pathParam],
                    allPathParameters: [pathParam],
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: false,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node18",
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(2);
            expect(params[0]?.name).toBe("file");
            expect(params[1]?.name).toBe("uploadId");
        });
    });

    describe("getFetcherRequestArgs", () => {
        it("returns file request type", () => {
            const fileProperty = createFileProperty("document");
            const fileBody = createFileUploadRequestBody({ properties: [fileProperty] });
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: false,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node18",
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            request.getBuildRequestStatements(context);
            const args = request.getFetcherRequestArgs(context);
            expect(args.requestType).toBe("file");
        });
    });

    describe("getBuildRequestStatements", () => {
        it("generates form data construction for single file", () => {
            const fileProperty = createFileProperty("document");
            const fileBody = createFileUploadRequestBody({ properties: [fileProperty] });
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: false,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node18",
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const statements = request.getBuildRequestStatements(context);
            const serialized = serializeStatements(statements);
            expect(serialized).toMatchSnapshot();
        });

        it("generates form data construction with body property", () => {
            const fileProperty = createFileProperty("document");
            const bodyProperty = createBodyPropertyForUpload("description", STRING_TYPE);
            const fileBody = createFileUploadRequestBody({
                properties: [fileProperty, bodyProperty]
            });
            const sdkRequest = createSdkRequestWrapper();
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: false,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node18",
                parameterNaming: "default"
            });
            const context = createEndpointRequestMockContext();
            const statements = request.getBuildRequestStatements(context);
            const serialized = serializeStatements(statements);
            expect(serialized).toMatchSnapshot();
        });
    });

    describe("getExampleEndpointImports", () => {
        it("returns fs createReadStream import", () => {
            const fileProperty = createFileProperty("document");
            const fileBody = createFileUploadRequestBody({ properties: [fileProperty] });
            const request = new GeneratedFileUploadEndpointRequest({
                ir: createMinimalIR(),
                packageId: { isRoot: true },
                service: createHttpService(),
                endpoint: createHttpEndpoint({
                    requestBody: fileBody,
                    sdkRequest: createSdkRequestWrapper()
                }),
                requestBody: fileBody,
                generatedSdkClientClass: createMockSdkClientClass(),
                retainOriginalCasing: false,
                inlineFileProperties: false,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false,
                formDataSupport: "Node18",
                parameterNaming: "default"
            });
            const imports = request.getExampleEndpointImports();
            expect(imports).toHaveLength(1);
            assert(imports[0] != null, "expected at least one import");
            const importStr = getTextOfTsNode(imports[0]);
            expect(importStr).toContain("createReadStream");
            expect(importStr).toContain("fs");
        });
    });
});

describe("GeneratedBytesEndpointRequest", () => {
    describe("getEndpointParameters", () => {
        it("includes uploadable parameter", () => {
            const request = createBytesEndpointRequest();
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params.length).toBeGreaterThanOrEqual(1);
            expect(params[0]?.name).toBe("uploadable");
            expect(params[0]?.type).toContain("core.Uploadable");
        });

        it("includes optional uploadable with undefined type", () => {
            const request = createBytesEndpointRequest({ isOptional: true });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params[0]?.type).toContain("undefined");
        });

        it("includes path params and uploadable together", () => {
            const pathParam = createPathParameter("fileId");
            const request = createBytesEndpointRequest({
                contentType: "application/octet-stream",
                pathParameters: [pathParam]
            });
            const context = createEndpointRequestMockContext();
            const params = request.getEndpointParameters(context);
            expect(params).toHaveLength(2);
            expect(params[0]?.name).toBe("uploadable");
            expect(params[1]?.name).toBe("fileId");
        });
    });

    describe("getFetcherRequestArgs", () => {
        it("returns bytes request type with duplex half", () => {
            const request = createBytesEndpointRequest({ contentType: "application/octet-stream" });
            const context = createEndpointRequestMockContext();
            request.getBuildRequestStatements(context);
            const args = request.getFetcherRequestArgs(context);
            expect(args.requestType).toBe("bytes");
            expect(args.contentType).toBe("application/octet-stream");
            assert(args.duplex != null, "duplex should not be null");
            expect(getTextOfTsNode(args.duplex as ts.Expression)).toBe('"half"');
        });

        it("passes through content type from request body", () => {
            const request = createBytesEndpointRequest({ contentType: "image/png" });
            const context = createEndpointRequestMockContext();
            request.getBuildRequestStatements(context);
            const args = request.getFetcherRequestArgs(context);
            expect(args.contentType).toBe("image/png");
        });
    });

    describe("getBuildRequestStatements", () => {
        it("generates binary upload request construction", () => {
            const request = createBytesEndpointRequest({ contentType: "application/octet-stream" });
            const context = createEndpointRequestMockContext();
            const statements = request.getBuildRequestStatements(context);
            const serialized = serializeStatements(statements);
            expect(serialized).toMatchSnapshot();
        });
    });

    describe("getExampleEndpointImports", () => {
        it("returns fs createReadStream import", () => {
            const request = createBytesEndpointRequest();
            const imports = request.getExampleEndpointImports();
            expect(imports).toHaveLength(1);
            assert(imports[0] != null, "expected at least one import");
            const importStr = getTextOfTsNode(imports[0]);
            expect(importStr).toContain("createReadStream");
            expect(importStr).toContain("fs");
        });
    });
});
