import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
    casingsGenerator,
    createHttpEndpoint,
    createHttpService,
    createInlinedRequestBody,
    createNameAndWireValue,
    createPathParameter,
    createSdkRequestWrapper,
    serializeStatements
} from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { FileUploadRequestParameter } from "../request-parameter/FileUploadRequestParameter.js";
import { RequestBodyParameter } from "../request-parameter/RequestBodyParameter.js";
import { RequestWrapperParameter } from "../request-parameter/RequestWrapperParameter.js";

const STRING_TYPE = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
const OPTIONAL_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.optional(STRING_TYPE));
const INTEGER_TYPE = FernIr.TypeReference.primitive({ v1: "INTEGER", v2: undefined });

// ──────────────────────────────────────────────────────────────────────────────
// Mock context
// ──────────────────────────────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
function createMockContext(opts?: { useDefaultValues?: boolean; useBigInt?: boolean }): any {
    return {
        includeSerdeLayer: true,
        retainOriginalCasing: false,
        inlineFileProperties: false,
        config: {
            customConfig: {
                useDefaultRequestParameterValues: opts?.useDefaultValues ?? false,
                useBigInt: opts?.useBigInt ?? false
            }
        },
        type: {
            stringify: (expr: ts.Expression) =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(expr, "toString"),
                    undefined,
                    []
                ),
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
                        ? innerType.primitive.v1 === "STRING"
                            ? "string"
                            : innerType.primitive.v1 === "INTEGER"
                              ? "number"
                              : "unknown"
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
            shouldInlinePathParameters: () => false,
            getReferenceToRequestWrapper: () => ts.factory.createTypeReferenceNode("TestRequest"),
            getGeneratedRequestWrapper: () => createMockGeneratedRequestWrapper()
        },
        case: caseConverter
    };
}

function createMockGeneratedRequestWrapper(opts?: {
    allPropertiesOptional?: boolean;
    hasBody?: boolean;
    inlinedBody?: boolean;
    nonBodyKeys?: { propertyName: string; safeName: string; originalParameter: unknown }[];
}) {
    return {
        areAllPropertiesOptional: () => opts?.allPropertiesOptional ?? false,
        areBodyPropertiesInlined: () => opts?.inlinedBody ?? true,
        hasBodyProperty: () => opts?.hasBody ?? false,
        getNonBodyKeys: () =>
            (opts?.nonBodyKeys ?? []).map((k) => ({ propertyName: k.propertyName, safeName: k.safeName })),
        getNonBodyKeysWithData: () => opts?.nonBodyKeys ?? [],
        getAllQueryParameters: () => [] as FernIr.QueryParameter[],
        getReferencedBodyPropertyName: () => "body",
        getPropertyNameOfQueryParameter: (qp: FernIr.QueryParameter) => ({
            propertyName: caseConverter.camelUnsafe(qp.name),
            safeName: caseConverter.camelUnsafe(qp.name)
        }),
        getPropertyNameOfPathParameter: (pp: FernIr.PathParameter) => ({
            propertyName: caseConverter.camelUnsafe(pp.name),
            safeName: caseConverter.camelUnsafe(pp.name)
        }),
        getPropertyNameOfNonLiteralHeader: (h: FernIr.HttpHeader) => ({
            propertyName: caseConverter.camelUnsafe(h.name),
            safeName: caseConverter.camelUnsafe(h.name)
        }),
        getInlinedRequestBodyPropertyKey: (p: FernIr.InlinedRequestBodyProperty) => ({
            propertyName: caseConverter.camelUnsafe(p.name),
            safeName: caseConverter.camelUnsafe(p.name)
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

function createSdkRequest(shape: FernIr.SdkRequestShape): FernIr.SdkRequest {
    return {
        streamParameter: undefined,
        requestParameterName: casingsGenerator.generateName("request"),
        shape
    };
}

// ========================== RequestBodyParameter ==========================

describe("RequestBodyParameter", () => {
    function createInstance(opts?: { requestBodyType?: FernIr.TypeReference }) {
        const requestBodyType = opts?.requestBodyType ?? STRING_TYPE;
        const sdkRequest = createSdkRequest(
            FernIr.SdkRequestShape.justRequestBody(
                FernIr.SdkRequestBodyType.typeReference({
                    requestBodyType,
                    contentType: undefined,
                    docs: undefined,
                    v2Examples: undefined
                })
            )
        );
        return new RequestBodyParameter({
            packageId: { isRoot: true },
            service: createHttpService(),
            endpoint: createHttpEndpoint({ sdkRequest }),
            sdkRequest,
            requestBodyReference: {
                requestBodyType,
                contentType: undefined,
                docs: undefined,
                v2Examples: undefined
            },
            caseConverter
        });
    }

    it("getType returns the type node for string body", () => {
        const param = createInstance();
        const context = createMockContext();
        const typeNode = param.getType(context);
        expect(getTextOfTsNode(typeNode)).toBe("string");
    });

    it("getInitialStatements returns empty array", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(param.getInitialStatements()).toEqual([]);
    });

    it("getReferenceToRequestBody returns identifier for request parameter name", () => {
        const param = createInstance();
        const context = createMockContext();
        const ref = param.getReferenceToRequestBody();
        expect(getTextOfTsNode(ref)).toBe("request");
    });

    it("getReferenceToNonLiteralHeader throws", () => {
        const param = createInstance();
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        const header = {} as any;
        const context = createMockContext();
        expect(() => param.getReferenceToNonLiteralHeader()).toThrow(
            "Cannot get reference to header because request is not wrapped"
        );
    });

    it("getAllQueryParameters returns empty array", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(param.getAllQueryParameters()).toEqual([]);
    });

    it("withQueryParameter throws", () => {
        const param = createInstance();
        // biome-ignore lint/suspicious/noExplicitAny: test mock
        const qp = {} as any;
        const context = createMockContext();
        expect(() => param.withQueryParameter()).toThrow(
            "Cannot reference query parameter because request is not wrapped"
        );
    });

    it("getReferenceToPathParameter throws", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(() => param.getReferenceToPathParameter()).toThrow(
            "Cannot reference path parameter because request is not wrapped"
        );
    });

    it("getReferenceToQueryParameter throws", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(() => param.getReferenceToQueryParameter()).toThrow(
            "Cannot reference query parameter because request is not wrapped"
        );
    });

    it("isOptional returns false for required string body", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(param.isOptional({ context })).toBe(false);
    });

    it("isOptional returns true for optional body", () => {
        const param = createInstance({ requestBodyType: OPTIONAL_STRING_TYPE });
        const context = createMockContext();
        expect(param.isOptional({ context })).toBe(true);
    });

    it("getParameterDeclaration returns correct structure", () => {
        const param = createInstance();
        const context = createMockContext();
        const decl = param.getParameterDeclaration(context);
        expect(decl.name).toBe("request");
        expect(decl.type).toBe("string");
        expect(decl.hasQuestionToken).toBe(false);
    });

    it("getParameterDeclaration has question token for optional body", () => {
        const param = createInstance({ requestBodyType: OPTIONAL_STRING_TYPE });
        const context = createMockContext();
        const decl = param.getParameterDeclaration(context);
        expect(decl.hasQuestionToken).toBe(true);
    });

    describe("generateExample", () => {
        it("returns undefined when example request is undefined", () => {
            const param = createInstance();
            const context = createMockContext();
            const result = param.generateExample({
                context,
                example: {
                    id: undefined,
                    name: undefined,
                    url: "/test",
                    rootPathParameters: [],
                    endpointPathParameters: [],
                    servicePathParameters: [],
                    endpointHeaders: [],
                    serviceHeaders: [],
                    queryParameters: [],
                    request: undefined,
                    response: FernIr.ExampleResponse.ok(FernIr.ExampleEndpointSuccessResponse.body(undefined)),
                    docs: undefined
                },
                opts: { isForComment: true }
            });
            expect(result).toBeUndefined();
        });

        it("returns undefined when example request is inlined (not reference)", () => {
            const param = createInstance();
            const context = createMockContext();
            const result = param.generateExample({
                context,
                example: {
                    id: undefined,
                    name: undefined,
                    url: "/test",
                    rootPathParameters: [],
                    endpointPathParameters: [],
                    servicePathParameters: [],
                    endpointHeaders: [],
                    serviceHeaders: [],
                    queryParameters: [],
                    request: FernIr.ExampleRequestBody.inlinedRequestBody({
                        jsonExample: undefined,
                        properties: [],
                        extraProperties: undefined
                    }),
                    response: FernIr.ExampleResponse.ok(FernIr.ExampleEndpointSuccessResponse.body(undefined)),
                    docs: undefined
                },
                opts: { isForComment: true }
            });
            expect(result).toBeUndefined();
        });
    });
});

// ========================== FileUploadRequestParameter ==========================

describe("FileUploadRequestParameter", () => {
    function createInstance(opts?: { pathParameters?: FernIr.PathParameter[] }) {
        const sdkRequest = createSdkRequest(
            FernIr.SdkRequestShape.wrapper({
                wrapperName: casingsGenerator.generateName("TestUpload"),
                bodyKey: casingsGenerator.generateName("body"),
                includePathParameters: undefined,
                onlyPathParameters: undefined
            })
        );
        return new FileUploadRequestParameter({
            packageId: { isRoot: true },
            service: createHttpService(),
            endpoint: createHttpEndpoint({
                sdkRequest,
                pathParameters: opts?.pathParameters,
                allPathParameters: opts?.pathParameters
            }),
            sdkRequest,
            caseConverter
        });
    }

    it("getType returns the request wrapper type", () => {
        const param = createInstance();
        const context = createMockContext();
        const typeNode = param.getType(context);
        expect(getTextOfTsNode(typeNode)).toBe("TestRequest");
    });

    it("getInitialStatements returns empty array", () => {
        const param = createInstance();
        expect(param.getInitialStatements()).toEqual([]);
    });

    it("getReferenceToRequestBody throws", () => {
        const param = createInstance();
        expect(() => param.getReferenceToRequestBody()).toThrow(
            "Cannot get reference to request body in file upload request"
        );
    });

    it("isOptional always returns false", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(param.isOptional({ context })).toBe(false);
    });

    it("getParameterDeclaration returns correct structure", () => {
        const param = createInstance();
        const context = createMockContext();
        const decl = param.getParameterDeclaration(context);
        expect(decl.name).toBe("request");
        expect(decl.type).toBe("TestRequest");
        expect(decl.hasQuestionToken).toBe(false);
    });

    it("getReferenceToProperty uses dot notation for valid identifiers", () => {
        const param = createInstance();
        const context = createMockContext();
        const header: FernIr.HttpHeader = {
            name: createNameAndWireValue("xCustom"),
            valueType: STRING_TYPE,
            env: undefined,
            availability: undefined,
            docs: undefined,
            v2Examples: undefined
        };
        const ref = param.getReferenceToNonLiteralHeader(header, context);
        expect(getTextOfTsNode(ref)).toContain(".");
    });

    it("getReferenceToProperty uses bracket notation for hyphenated names", () => {
        const param = createInstance();
        // Override getGeneratedRequestWrapper to return hyphenated property name
        const context = createMockContext();
        context.requestWrapper.getGeneratedRequestWrapper = () => ({
            ...createMockGeneratedRequestWrapper(),
            getPropertyNameOfNonLiteralHeader: () => ({
                propertyName: "x-custom-header",
                safeName: "xCustomHeader"
            })
        });
        const header: FernIr.HttpHeader = {
            name: createNameAndWireValue("x-custom-header"),
            valueType: STRING_TYPE,
            env: undefined,
            availability: undefined,
            docs: undefined,
            v2Examples: undefined
        };
        const ref = param.getReferenceToNonLiteralHeader(header, context);
        const text = getTextOfTsNode(ref);
        expect(text).toContain("[");
        expect(text).toContain("x-custom-header");
    });

    it("getReferenceToPathParameter throws when path param not found", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(() => param.getReferenceToPathParameter("nonExistent", context)).toThrow(
            "Path parameter does not exist: nonExistent"
        );
    });

    it("getReferenceToQueryParameter throws when query param not found", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(() => param.getReferenceToQueryParameter("nonExistent", context)).toThrow(
            "Query parameter does not exist: nonExistent"
        );
    });

    it("getReferenceToPathParameter returns reference when path param exists", () => {
        const pathParam = createPathParameter("userId");
        const param = createInstance({ pathParameters: [pathParam] });
        const context = createMockContext();
        const ref = param.getReferenceToPathParameter("userId", context);
        expect(getTextOfTsNode(ref)).toContain("userId");
    });

    it("getReferenceToBodyProperty returns property access", () => {
        const param = createInstance();
        const context = createMockContext();
        const bodyProp: FernIr.InlinedRequestBodyProperty = {
            name: createNameAndWireValue("data"),
            valueType: STRING_TYPE,
            docs: undefined,
            availability: undefined,
            v2Examples: undefined,
            propertyAccess: undefined
        };
        const ref = param.getReferenceToBodyProperty(bodyProp, context);
        expect(getTextOfTsNode(ref)).toContain("data");
    });
});

// ========================== RequestWrapperParameter ==========================

describe("RequestWrapperParameter", () => {
    function createInstance(opts?: {
        pathParameters?: FernIr.PathParameter[];
        queryParameters?: FernIr.QueryParameter[];
        requestBody?: FernIr.HttpRequestBody;
    }) {
        const sdkRequest = createSdkRequestWrapper();
        return new RequestWrapperParameter({
            packageId: { isRoot: true },
            service: createHttpService(),
            endpoint: createHttpEndpoint({
                sdkRequest,
                pathParameters: opts?.pathParameters,
                allPathParameters: opts?.pathParameters,
                queryParameters: opts?.queryParameters,
                requestBody: opts?.requestBody
            }),
            sdkRequest,
            caseConverter
        });
    }

    it("getType returns the request wrapper type", () => {
        const param = createInstance();
        const context = createMockContext();
        const typeNode = param.getType(context);
        expect(getTextOfTsNode(typeNode)).toBe("TestRequest");
    });

    it("getInitialStatements returns empty when no non-body keys and no body", () => {
        const param = createInstance();
        const context = createMockContext();
        const stmts = param.getInitialStatements(context, { variablesInScope: [] });
        expect(stmts).toEqual([]);
    });

    it("getInitialStatements returns destructuring when there are non-body keys", () => {
        const param = createInstance();
        const context = createMockContext();
        // Override to return non-body keys
        context.requestWrapper.getGeneratedRequestWrapper = () =>
            createMockGeneratedRequestWrapper({
                nonBodyKeys: [
                    {
                        propertyName: "userId",
                        safeName: "userId",
                        originalParameter: undefined
                    }
                ]
            });
        const stmts = param.getInitialStatements(context, { variablesInScope: [] });
        expect(stmts).toHaveLength(1);
        expect(serializeStatements(stmts)).toMatchSnapshot();
    });

    it("getInitialStatements handles variable name conflicts", () => {
        const param = createInstance();
        const context = createMockContext();
        context.requestWrapper.getGeneratedRequestWrapper = () =>
            createMockGeneratedRequestWrapper({
                nonBodyKeys: [
                    {
                        propertyName: "data",
                        safeName: "data",
                        originalParameter: undefined
                    }
                ]
            });
        const stmts = param.getInitialStatements(context, { variablesInScope: ["data"] });
        expect(stmts).toHaveLength(1);
        const output = serializeStatements(stmts);
        // Should rename to data_ to avoid conflict
        expect(output).toContain("data_");
        expect(output).toMatchSnapshot();
    });

    it("getInitialStatements includes body property when hasBodyProperty=true", () => {
        const param = createInstance();
        const context = createMockContext();
        context.requestWrapper.getGeneratedRequestWrapper = () =>
            createMockGeneratedRequestWrapper({
                hasBody: true,
                nonBodyKeys: [
                    {
                        propertyName: "userId",
                        safeName: "userId",
                        originalParameter: undefined
                    }
                ]
            });
        const stmts = param.getInitialStatements(context, { variablesInScope: [] });
        expect(stmts).toHaveLength(1);
        const output = serializeStatements(stmts);
        expect(output).toContain("_body");
        expect(output).toMatchSnapshot();
    });

    it("getInitialStatements uses spread for inlined body with non-body keys", () => {
        const param = createInstance();
        const context = createMockContext();
        context.requestWrapper.getGeneratedRequestWrapper = () =>
            createMockGeneratedRequestWrapper({
                hasBody: false,
                inlinedBody: true,
                nonBodyKeys: [
                    {
                        propertyName: "userId",
                        safeName: "userId",
                        originalParameter: undefined
                    }
                ]
            });
        const stmts = param.getInitialStatements(context, { variablesInScope: [] });
        expect(stmts).toHaveLength(1);
        const output = serializeStatements(stmts);
        expect(output).toContain("...");
        expect(output).toContain("_body");
        expect(output).toMatchSnapshot();
    });

    it("getReferenceToRequestBody returns _body when hasBodyProperty is true", () => {
        const param = createInstance({
            requestBody: FernIr.HttpRequestBody.inlinedRequestBody(createInlinedRequestBody())
        });
        const context = createMockContext();
        context.requestWrapper.getGeneratedRequestWrapper = () =>
            createMockGeneratedRequestWrapper({
                hasBody: true,
                nonBodyKeys: []
            });
        const ref = param.getReferenceToRequestBody(context);
        expect(ref).toBeDefined();
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(ref!)).toBe("_body");
    });

    it("getReferenceToRequestBody returns request name when no body or inlined props", () => {
        const param = createInstance({
            requestBody: FernIr.HttpRequestBody.inlinedRequestBody(createInlinedRequestBody())
        });
        const context = createMockContext();
        context.requestWrapper.getGeneratedRequestWrapper = () =>
            createMockGeneratedRequestWrapper({
                hasBody: false,
                inlinedBody: false,
                nonBodyKeys: []
            });
        const ref = param.getReferenceToRequestBody(context);
        expect(ref).toBeDefined();
        // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
        expect(getTextOfTsNode(ref!)).toBe("request");
    });

    it("getReferenceToRequestBody returns undefined when endpoint has no request body", () => {
        const param = createInstance({ requestBody: undefined });
        const context = createMockContext();
        const ref = param.getReferenceToRequestBody(context);
        expect(ref).toBeUndefined();
    });

    it("isOptional delegates to areAllPropertiesOptional", () => {
        const param = createInstance();
        const context = createMockContext();
        context.requestWrapper.getGeneratedRequestWrapper = () =>
            createMockGeneratedRequestWrapper({ allPropertiesOptional: true });
        expect(param.isOptional({ context })).toBe(true);
    });

    it("getReferenceToPathParameter throws when path param not found", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(() => param.getReferenceToPathParameter("nonExistent", context)).toThrow(
            "Path parameter does not exist: nonExistent"
        );
    });

    it("getReferenceToQueryParameter throws when query param not found", () => {
        const param = createInstance();
        const context = createMockContext();
        expect(() => param.getReferenceToQueryParameter("nonExistent", context)).toThrow(
            "Query parameter does not exist: nonExistent"
        );
    });

    it("getParameterType returns initializer when all properties optional", () => {
        const param = createInstance();
        const context = createMockContext();
        context.requestWrapper.getGeneratedRequestWrapper = () =>
            createMockGeneratedRequestWrapper({ allPropertiesOptional: true });
        const decl = param.getParameterDeclaration(context);
        expect(decl.initializer).toBeDefined();
    });

    describe("extractDefaultValue", () => {
        it("returns numeric default for integer type with default value", () => {
            const param = createInstance();
            const context = createMockContext({ useDefaultValues: true });
            context.requestWrapper.getGeneratedRequestWrapper = () =>
                createMockGeneratedRequestWrapper({
                    nonBodyKeys: [
                        {
                            propertyName: "limit",
                            safeName: "limit",
                            originalParameter: {
                                type: "query",
                                parameter: {
                                    valueType: FernIr.TypeReference.primitive({
                                        v1: "INTEGER",
                                        v2: FernIr.PrimitiveTypeV2.integer({
                                            default: 10,
                                            validation: undefined
                                        })
                                    })
                                }
                            }
                        }
                    ]
                });
            const stmts = param.getInitialStatements(context, { variablesInScope: [] });
            expect(stmts).toHaveLength(1);
            const output = serializeStatements(stmts);
            expect(output).toContain("10");
            expect(output).toMatchSnapshot();
        });

        it("returns string default for string type with default value", () => {
            const param = createInstance();
            const context = createMockContext({ useDefaultValues: true });
            context.requestWrapper.getGeneratedRequestWrapper = () =>
                createMockGeneratedRequestWrapper({
                    nonBodyKeys: [
                        {
                            propertyName: "sort",
                            safeName: "sort",
                            originalParameter: {
                                type: "query",
                                parameter: {
                                    valueType: FernIr.TypeReference.primitive({
                                        v1: "STRING",
                                        v2: FernIr.PrimitiveTypeV2.string({
                                            default: "asc",
                                            validation: undefined
                                        })
                                    })
                                }
                            }
                        }
                    ]
                });
            const stmts = param.getInitialStatements(context, { variablesInScope: [] });
            expect(stmts).toHaveLength(1);
            const output = serializeStatements(stmts);
            expect(output).toContain('"asc"');
            expect(output).toMatchSnapshot();
        });

        it("returns boolean default for boolean type with default value", () => {
            const param = createInstance();
            const context = createMockContext({ useDefaultValues: true });
            context.requestWrapper.getGeneratedRequestWrapper = () =>
                createMockGeneratedRequestWrapper({
                    nonBodyKeys: [
                        {
                            propertyName: "verbose",
                            safeName: "verbose",
                            originalParameter: {
                                type: "query",
                                parameter: {
                                    valueType: FernIr.TypeReference.primitive({
                                        v1: "BOOLEAN",
                                        v2: FernIr.PrimitiveTypeV2.boolean({
                                            default: true
                                        })
                                    })
                                }
                            }
                        }
                    ]
                });
            const stmts = param.getInitialStatements(context, { variablesInScope: [] });
            expect(stmts).toHaveLength(1);
            const output = serializeStatements(stmts);
            expect(output).toContain("true");
            expect(output).toMatchSnapshot();
        });

        it("returns BigInt call for long type with useBigInt", () => {
            const param = createInstance();
            const context = createMockContext({ useDefaultValues: true, useBigInt: true });
            context.requestWrapper.getGeneratedRequestWrapper = () =>
                createMockGeneratedRequestWrapper({
                    nonBodyKeys: [
                        {
                            propertyName: "bigId",
                            safeName: "bigId",
                            originalParameter: {
                                type: "query",
                                parameter: {
                                    valueType: FernIr.TypeReference.primitive({
                                        v1: "LONG",
                                        v2: FernIr.PrimitiveTypeV2.long({
                                            default: 9007199254740991,
                                            validation: undefined
                                        })
                                    })
                                }
                            }
                        }
                    ]
                });
            const stmts = param.getInitialStatements(context, { variablesInScope: [] });
            expect(stmts).toHaveLength(1);
            const output = serializeStatements(stmts);
            expect(output).toContain("BigInt");
            expect(output).toMatchSnapshot();
        });

        it("returns numeric literal for double type with default value", () => {
            const param = createInstance();
            const context = createMockContext({ useDefaultValues: true });
            context.requestWrapper.getGeneratedRequestWrapper = () =>
                createMockGeneratedRequestWrapper({
                    nonBodyKeys: [
                        {
                            propertyName: "rate",
                            safeName: "rate",
                            originalParameter: {
                                type: "query",
                                parameter: {
                                    valueType: FernIr.TypeReference.primitive({
                                        v1: "DOUBLE",
                                        v2: FernIr.PrimitiveTypeV2.double({
                                            default: 0.5,
                                            validation: undefined
                                        })
                                    })
                                }
                            }
                        }
                    ]
                });
            const stmts = param.getInitialStatements(context, { variablesInScope: [] });
            expect(stmts).toHaveLength(1);
            const output = serializeStatements(stmts);
            expect(output).toContain("0.5");
            expect(output).toMatchSnapshot();
        });

        it("returns BigInt call for bigInteger type with useBigInt", () => {
            const param = createInstance();
            const context = createMockContext({ useDefaultValues: true, useBigInt: true });
            context.requestWrapper.getGeneratedRequestWrapper = () =>
                createMockGeneratedRequestWrapper({
                    nonBodyKeys: [
                        {
                            propertyName: "bigVal",
                            safeName: "bigVal",
                            originalParameter: {
                                type: "query",
                                parameter: {
                                    valueType: FernIr.TypeReference.primitive({
                                        v1: "BIG_INTEGER",
                                        v2: FernIr.PrimitiveTypeV2.bigInteger({
                                            default: "123456789012345678901234567890"
                                        })
                                    })
                                }
                            }
                        }
                    ]
                });
            const stmts = param.getInitialStatements(context, { variablesInScope: [] });
            expect(stmts).toHaveLength(1);
            const output = serializeStatements(stmts);
            expect(output).toContain("BigInt");
            expect(output).toMatchSnapshot();
        });

        it("returns string literal for bigInteger type without useBigInt", () => {
            const param = createInstance();
            const context = createMockContext({ useDefaultValues: true, useBigInt: false });
            context.requestWrapper.getGeneratedRequestWrapper = () =>
                createMockGeneratedRequestWrapper({
                    nonBodyKeys: [
                        {
                            propertyName: "bigVal",
                            safeName: "bigVal",
                            originalParameter: {
                                type: "query",
                                parameter: {
                                    valueType: FernIr.TypeReference.primitive({
                                        v1: "BIG_INTEGER",
                                        v2: FernIr.PrimitiveTypeV2.bigInteger({
                                            default: "123456789"
                                        })
                                    })
                                }
                            }
                        }
                    ]
                });
            const stmts = param.getInitialStatements(context, { variablesInScope: [] });
            expect(stmts).toHaveLength(1);
            const output = serializeStatements(stmts);
            expect(output).toContain('"123456789"');
            expect(output).toMatchSnapshot();
        });

        it("returns no default for file type parameter", () => {
            const param = createInstance();
            const context = createMockContext({ useDefaultValues: true });
            context.requestWrapper.getGeneratedRequestWrapper = () =>
                createMockGeneratedRequestWrapper({
                    nonBodyKeys: [
                        {
                            propertyName: "avatar",
                            safeName: "avatar",
                            originalParameter: {
                                type: "file",
                                parameter: {}
                            }
                        }
                    ]
                });
            const stmts = param.getInitialStatements(context, { variablesInScope: [] });
            expect(stmts).toHaveLength(1);
            // File type parameters should not have a default value assignment (= value)
            // The destructuring `= request` is expected; we check there's no default VALUE like `= 10`
            const output = serializeStatements(stmts);
            // avatar should appear but without a default value initializer in the binding
            expect(output).toContain("avatar");
            expect(output).toMatchSnapshot();
        });

        it("unwraps optional before extracting default", () => {
            const param = createInstance();
            const context = createMockContext({ useDefaultValues: true });
            context.requestWrapper.getGeneratedRequestWrapper = () =>
                createMockGeneratedRequestWrapper({
                    nonBodyKeys: [
                        {
                            propertyName: "limit",
                            safeName: "limit",
                            originalParameter: {
                                type: "query",
                                parameter: {
                                    valueType: FernIr.TypeReference.container(
                                        FernIr.ContainerType.optional(
                                            FernIr.TypeReference.primitive({
                                                v1: "INTEGER",
                                                v2: FernIr.PrimitiveTypeV2.integer({
                                                    default: 25,
                                                    validation: undefined
                                                })
                                            })
                                        )
                                    )
                                }
                            }
                        }
                    ]
                });
            const stmts = param.getInitialStatements(context, { variablesInScope: [] });
            expect(stmts).toHaveLength(1);
            const output = serializeStatements(stmts);
            expect(output).toContain("25");
            expect(output).toMatchSnapshot();
        });
    });
});
