import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { createMockCoreUtilities } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { generateEndpointMetadata } from "../endpoints/utils/generateEndpointMetadata.js";

function createMockContext() {
    const coreUtilities = createMockCoreUtilities();
    // Add EndpointMetadata which is not in the default mock
    // biome-ignore lint/suspicious/noExplicitAny: test mock - EndpointMetadata not in default mock type
    (coreUtilities.fetcher as any).EndpointMetadata = {
        _getReferenceToType: () => ts.factory.createTypeReferenceNode("EndpointMetadata")
    };
    return {
        coreUtilities
        // biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
    } as any;
}

function createEndpoint(security?: Record<string, string[]>[]): FernIr.HttpEndpoint {
    return {
        id: "endpoint_test",
        name: {
            originalName: "test",
            camelCase: { unsafeName: "test", safeName: "test" },
            snakeCase: { unsafeName: "test", safeName: "test" },
            screamingSnakeCase: { unsafeName: "TEST", safeName: "TEST" },
            pascalCase: { unsafeName: "Test", safeName: "Test" }
        },
        displayName: undefined,
        method: "POST",
        headers: [],
        baseUrl: undefined,
        path: { head: "/test", parts: [] },
        fullPath: { head: "/test", parts: [] },
        pathParameters: [],
        allPathParameters: [],
        queryParameters: [],
        requestBody: undefined,
        sdkRequest: undefined,
        response: undefined,
        errors: [],
        auth: true,
        idempotent: false,
        basePath: undefined,
        examples: [],
        userSpecifiedExamples: [],
        pagination: undefined,
        availability: undefined,
        docs: undefined,
        transport: undefined,
        security
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function statementsToString(statements: ts.Statement[]): string {
    return statements.map((s) => getTextOfTsNode(s)).join("\n");
}

describe("generateEndpointMetadata", () => {
    it("generates metadata with undefined security when security is undefined", () => {
        const result = generateEndpointMetadata({
            httpEndpoint: createEndpoint(undefined),
            context: createMockContext()
        });

        expect(result).toHaveLength(1);
        const text = statementsToString(result);
        expect(text).toContain("_metadata");
        expect(text).toContain("undefined");
        expect(text).toMatchSnapshot();
    });

    it("generates metadata with empty security array", () => {
        const result = generateEndpointMetadata({
            httpEndpoint: createEndpoint([]),
            context: createMockContext()
        });

        expect(result).toHaveLength(1);
        const text = statementsToString(result);
        expect(text).toContain("security");
        expect(text).toMatchSnapshot();
    });

    it("generates metadata with single security requirement with no scopes", () => {
        const result = generateEndpointMetadata({
            httpEndpoint: createEndpoint([{ apiKeyScheme: [] }]),
            context: createMockContext()
        });

        const text = statementsToString(result);
        expect(text).toContain("apiKeyScheme");
        expect(text).toMatchSnapshot();
    });

    it("generates metadata with single security requirement with scopes", () => {
        const result = generateEndpointMetadata({
            httpEndpoint: createEndpoint([{ myOAuthScheme: ["read", "write"] }]),
            context: createMockContext()
        });

        const text = statementsToString(result);
        expect(text).toContain("myOAuthScheme");
        expect(text).toContain('"read"');
        expect(text).toContain('"write"');
        expect(text).toMatchSnapshot();
    });

    it("generates metadata with multiple security requirements", () => {
        const result = generateEndpointMetadata({
            httpEndpoint: createEndpoint([
                { apiKeyScheme: [], myOAuthScheme: ["read", "write"] },
                { anotherApiKeyScheme: [] }
            ]),
            context: createMockContext()
        });

        const text = statementsToString(result);
        expect(text).toContain("apiKeyScheme");
        expect(text).toContain("myOAuthScheme");
        expect(text).toContain("anotherApiKeyScheme");
        expect(text).toContain('"read"');
        expect(text).toContain('"write"');
        expect(text).toMatchSnapshot();
    });

    it("generates const variable declaration for metadata", () => {
        const result = generateEndpointMetadata({
            httpEndpoint: createEndpoint([{ bearerAuth: [] }]),
            context: createMockContext()
        });

        const text = statementsToString(result);
        // Should be a const declaration
        expect(text).toContain("const _metadata");
        expect(text).toMatchSnapshot();
    });
});
