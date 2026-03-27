import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import {
    casingsGenerator,
    createHttpEndpoint,
    createHttpService,
    createNameAndWireValue,
    createSdkRequestWrapper
} from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";

import { RequestWrapperExampleGenerator } from "../RequestWrapperExampleGenerator.js";
import { RequestWrapperGenerator } from "../RequestWrapperGenerator.js";

// ── Helpers ────────────────────────────────────────────────────────────

const STRING_TYPE = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });

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

// ── RequestWrapperGenerator ───────────────────────────────────────────

describe("RequestWrapperGenerator", () => {
    it("generates a request wrapper", () => {
        const generator = new RequestWrapperGenerator();
        const result = generator.generateRequestWrapper({
            service: createHttpService(),
            endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() }),
            wrapperName: "TestRequest",
            packageId: { isRoot: true } as PackageId,
            includeSerdeLayer: true,
            retainOriginalCasing: false,
            inlineFileProperties: false,
            enableInlineTypes: false,
            shouldInlinePathParameters: false,
            formDataSupport: "Node18",
            flattenRequestParameters: false,
            parameterNaming: "default",
            resolveQueryParameterNameConflicts: false
        });
        expect(result).toBeDefined();
    });

    it("generates a request wrapper with retainOriginalCasing", () => {
        const generator = new RequestWrapperGenerator();
        const result = generator.generateRequestWrapper({
            service: createHttpService(),
            endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() }),
            wrapperName: "TestRequest",
            packageId: { isRoot: true } as PackageId,
            includeSerdeLayer: true,
            retainOriginalCasing: true,
            inlineFileProperties: false,
            enableInlineTypes: false,
            shouldInlinePathParameters: false,
            formDataSupport: "Node18",
            flattenRequestParameters: false,
            parameterNaming: "default",
            resolveQueryParameterNameConflicts: false
        });
        expect(result).toBeDefined();
    });

    it("generates a request wrapper with Node16 formDataSupport", () => {
        const generator = new RequestWrapperGenerator();
        const result = generator.generateRequestWrapper({
            service: createHttpService(),
            endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() }),
            wrapperName: "TestRequest",
            packageId: { isRoot: true } as PackageId,
            includeSerdeLayer: true,
            retainOriginalCasing: false,
            inlineFileProperties: false,
            enableInlineTypes: false,
            shouldInlinePathParameters: false,
            formDataSupport: "Node16",
            flattenRequestParameters: false,
            parameterNaming: "default",
            resolveQueryParameterNameConflicts: false
        });
        expect(result).toBeDefined();
    });

    it("generates a request wrapper with flattenRequestParameters", () => {
        const generator = new RequestWrapperGenerator();
        const result = generator.generateRequestWrapper({
            service: createHttpService(),
            endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() }),
            wrapperName: "TestRequest",
            packageId: { isRoot: true } as PackageId,
            includeSerdeLayer: true,
            retainOriginalCasing: false,
            inlineFileProperties: false,
            enableInlineTypes: false,
            shouldInlinePathParameters: false,
            formDataSupport: "Node18",
            flattenRequestParameters: true,
            parameterNaming: "default",
            resolveQueryParameterNameConflicts: false
        });
        expect(result).toBeDefined();
    });

    it("generates a request wrapper with wireValue parameterNaming", () => {
        const generator = new RequestWrapperGenerator();
        const result = generator.generateRequestWrapper({
            service: createHttpService(),
            endpoint: createHttpEndpoint({ sdkRequest: createSdkRequestWrapper() }),
            wrapperName: "TestRequest",
            packageId: { isRoot: true } as PackageId,
            includeSerdeLayer: true,
            retainOriginalCasing: false,
            inlineFileProperties: false,
            enableInlineTypes: false,
            shouldInlinePathParameters: false,
            formDataSupport: "Node18",
            flattenRequestParameters: false,
            parameterNaming: "wireValue",
            resolveQueryParameterNameConflicts: false
        });
        expect(result).toBeDefined();
    });
});

// ── RequestWrapperExampleGenerator ────────────────────────────────────

describe("RequestWrapperExampleGenerator", () => {
    it("generates example with no request body", () => {
        const generator = new RequestWrapperExampleGenerator();
        const result = generator.generateExample({
            bodyPropertyName: "body",
            example: createExampleEndpointCall(),
            packageId: { isRoot: true } as PackageId,
            endpointName: casingsGenerator.generateName("getUser"),
            requestBody: undefined,
            flattenRequestParameters: false
        });
        expect(result).toBeDefined();
    });

    it("generates example with inlined request body", () => {
        const generator = new RequestWrapperExampleGenerator();
        const result = generator.generateExample({
            bodyPropertyName: "body",
            example: createExampleEndpointCall({
                request: FernIr.ExampleRequestBody.inlinedRequestBody({
                    properties: [],
                    jsonExample: undefined,
                    extraProperties: undefined
                })
            }),
            packageId: { isRoot: true } as PackageId,
            endpointName: casingsGenerator.generateName("createUser"),
            requestBody: FernIr.HttpRequestBody.inlinedRequestBody({
                name: casingsGenerator.generateName("CreateUserRequest"),
                extends: [],
                properties: [],
                contentType: undefined,
                v2Examples: undefined,
                extendedProperties: undefined,
                extraProperties: false,
                docs: undefined
            }),
            flattenRequestParameters: false
        });
        expect(result).toBeDefined();
    });

    it("generates example with reference request body", () => {
        const generator = new RequestWrapperExampleGenerator();
        const result = generator.generateExample({
            bodyPropertyName: "body",
            example: createExampleEndpointCall({
                request: FernIr.ExampleRequestBody.reference({
                    shape: FernIr.ExampleTypeReferenceShape.primitive(
                        FernIr.ExamplePrimitive.string({ original: "test-value" })
                    ),
                    jsonExample: "test-value"
                })
            }),
            packageId: { isRoot: true } as PackageId,
            endpointName: casingsGenerator.generateName("updateUser"),
            requestBody: FernIr.HttpRequestBody.reference({
                requestBodyType: STRING_TYPE,
                contentType: undefined,
                docs: undefined,
                v2Examples: undefined
            }),
            flattenRequestParameters: false
        });
        expect(result).toBeDefined();
    });

    it("generates example with flattenRequestParameters", () => {
        const generator = new RequestWrapperExampleGenerator();
        const result = generator.generateExample({
            bodyPropertyName: "body",
            example: createExampleEndpointCall(),
            packageId: { isRoot: true } as PackageId,
            endpointName: casingsGenerator.generateName("getUser"),
            requestBody: undefined,
            flattenRequestParameters: true
        });
        expect(result).toBeDefined();
    });

    it("generates example with query parameters", () => {
        const generator = new RequestWrapperExampleGenerator();
        const result = generator.generateExample({
            bodyPropertyName: "body",
            example: createExampleEndpointCall({
                queryParameters: [
                    {
                        name: createNameAndWireValue("limit", "limit"),
                        value: {
                            shape: FernIr.ExampleTypeReferenceShape.primitive(FernIr.ExamplePrimitive.integer(10)),
                            jsonExample: 10
                        },
                        shape: undefined
                    }
                ]
            }),
            packageId: { isRoot: true } as PackageId,
            endpointName: casingsGenerator.generateName("listUsers"),
            requestBody: undefined,
            flattenRequestParameters: false
        });
        expect(result).toBeDefined();
    });

    it("generates example with headers", () => {
        const generator = new RequestWrapperExampleGenerator();
        const result = generator.generateExample({
            bodyPropertyName: "body",
            example: createExampleEndpointCall({
                serviceHeaders: [
                    {
                        name: createNameAndWireValue("X-Api-Key", "X-Api-Key"),
                        value: {
                            shape: FernIr.ExampleTypeReferenceShape.primitive(
                                FernIr.ExamplePrimitive.string({ original: "api-key-123" })
                            ),
                            jsonExample: "api-key-123"
                        }
                    }
                ]
            }),
            packageId: { isRoot: true } as PackageId,
            endpointName: casingsGenerator.generateName("getUser"),
            requestBody: undefined,
            flattenRequestParameters: false
        });
        expect(result).toBeDefined();
    });
});
