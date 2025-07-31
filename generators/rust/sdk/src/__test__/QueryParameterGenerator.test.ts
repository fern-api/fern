import { describe, it, expect } from "vitest";
import { IntermediateRepresentation, HttpEndpoint, QueryParameter } from "@fern-fern/ir-sdk/api";
import { SubClientGenerator } from "../generators/SubClientGenerator";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import * as FernIr from "@fern-fern/ir-sdk/api";

// Mock function to create basic IR structure
function createMockIR(services: Record<string, any> = {}): IntermediateRepresentation {
    return {
        apiName: {
            originalName: "TestAPI",
            camelCase: { unsafeName: "testApi", safeName: "testApi" },
            snakeCase: { unsafeName: "test_api", safeName: "test_api" },
            screamingSnakeCase: { unsafeName: "TEST_API", safeName: "TEST_API" },
            pascalCase: { unsafeName: "TestAPI", safeName: "TestAPI" }
        },
        apiVersion: "1.0.0",
        errors: {},
        types: {},
        services
    } as unknown as IntermediateRepresentation;
}

// Mock function to create query parameter
function createQueryParameter(name: string, wireValue: string): QueryParameter {
    return {
        name: {
            name: {
                originalName: name,
                camelCase: { unsafeName: name.toLowerCase(), safeName: name.toLowerCase() },
                snakeCase: { unsafeName: name.toLowerCase(), safeName: name.toLowerCase() },
                screamingSnakeCase: { unsafeName: name.toUpperCase(), safeName: name.toUpperCase() },
                pascalCase: { unsafeName: name, safeName: name }
            },
            wireValue
        },
        valueType: {
            type: "primitive",
            primitive: "STRING"
        } as FernIr.TypeReference.Primitive,
        allowMultiple: false,
        docs: undefined,
        availability: undefined
    } as QueryParameter;
}

// Mock function to create HTTP endpoint with query parameters
function createHttpEndpoint(name: string, queryParams: QueryParameter[] = []): HttpEndpoint {
    return {
        name: {
            originalName: name,
            camelCase: { unsafeName: name.toLowerCase(), safeName: name.toLowerCase() },
            snakeCase: { unsafeName: name.toLowerCase(), safeName: name.toLowerCase() },
            screamingSnakeCase: { unsafeName: name.toUpperCase(), safeName: name.toUpperCase() },
            pascalCase: { unsafeName: name, safeName: name }
        },
        displayName: undefined,
        method: "GET",
        fullPath: {
            head: "/api/test",
            parts: []
        },
        pathParameters: [],
        allPathParameters: [],
        queryParameters: queryParams,
        headers: [],
        requestBody: undefined,
        sdkRequest: undefined,
        response: {
            type: "json",
            responseBodyType: {
                type: "primitive",
                primitive: "STRING"
            } as FernIr.TypeReference.Primitive
        } as FernIr.HttpResponse.Json,
        errors: [],
        auth: false,
        idempotent: undefined,
        availability: undefined,
        docs: undefined,
        examples: []
    } as HttpEndpoint;
}

// Mock function to create context
function createMockContext(ir: IntermediateRepresentation): SdkGeneratorContext {
    return {
        ir,
        getClientName: () => "TestClient",
        customConfig: { generateExamples: false }
    } as SdkGeneratorContext;
}

describe("QueryParameterGenerator", () => {
    it("should generate method without query parameters correctly", async () => {
        const ir = createMockIR();
        const context = createMockContext(ir);
        const generator = new SubClientGenerator("TestService", [], context);
        
        const endpoint = createHttpEndpoint("getTest");
        
        // Access private method for testing
        const method = (generator as any).generateHttpMethod(endpoint);
        
        // Format the method body for snapshot comparison
        const methodSignature = `pub async fn ${method.name}(${method.parameters.join(", ")}) -> ${method.returnType}`;
        const methodBody = method.body;
        const fullMethod = `${methodSignature} {\n    ${methodBody}\n}`;
        
        await expect(fullMethod).toMatchFileSnapshot("snapshots/method-without-query-params.rs");
    });
    
    it("should generate method with single query parameter correctly", async () => {
        const ir = createMockIR();
        const context = createMockContext(ir);
        const generator = new SubClientGenerator("TestService", [], context);
        
        const queryParam = createQueryParameter("limit", "limit");
        const endpoint = createHttpEndpoint("getTest", [queryParam]);
        
        // Access private method for testing
        const method = (generator as any).generateHttpMethod(endpoint);
        
        // Format the method body for snapshot comparison
        const methodSignature = `pub async fn ${method.name}(${method.parameters.join(", ")}) -> ${method.returnType}`;
        const methodBody = method.body;
        const fullMethod = `${methodSignature} {\n    ${methodBody}\n}`;
        
        await expect(fullMethod).toMatchFileSnapshot("snapshots/method-with-single-query-param.rs");
    });
    
    it("should generate method with multiple query parameters correctly", async () => {
        const ir = createMockIR();
        const context = createMockContext(ir);
        const generator = new SubClientGenerator("TestService", [], context);
        
        const queryParam1 = createQueryParameter("limit", "limit");
        const queryParam2 = createQueryParameter("offset", "offset");
        const endpoint = createHttpEndpoint("getTest", [queryParam1, queryParam2]);
        
        // Access private method for testing
        const method = (generator as any).generateHttpMethod(endpoint);
        
        // Format the method body for snapshot comparison
        const methodSignature = `pub async fn ${method.name}(${method.parameters.join(", ")}) -> ${method.returnType}`;
        const methodBody = method.body;
        const fullMethod = `${methodSignature} {\n    ${methodBody}\n}`;
        
        await expect(fullMethod).toMatchFileSnapshot("snapshots/method-with-multiple-query-params.rs");
    });
});