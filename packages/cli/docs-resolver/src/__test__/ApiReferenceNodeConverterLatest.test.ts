import { FdrAPI } from "@fern-api/fdr-sdk";
import { findEndpointByLocator, findSubpackageByLocator, findWebhookByLocator, findWebSocketByLocator, getOaiLocator } from "../ApiReferenceNodeConverterLatest";

describe.skip("getOaiLocator", () => {
    it("converts path parameters correctly", () => {
        expect(getOaiLocator("/users/:id/posts/:postId")).toBe("/users/{id}/posts/{postId}");
        expect(getOaiLocator("/simple/path")).toBe("/simple/path");
        expect(getOaiLocator("/:param")).toBe("/{param}");
    });
});

describe.skip("findSubpackageByLocator", () => {
    const mockSubpackages = {
        [FdrAPI.api.v1.SubpackageId("test")]: { id: FdrAPI.api.v1.SubpackageId("test"), name: "test", displayName: "test" },
        [FdrAPI.api.v1.SubpackageId("nested.package")]: {
            id: FdrAPI.api.v1.SubpackageId("nested.package"),
            name: "nested",
            displayName: "nested"
        }
    };

    it("finds subpackage by exact match", () => {
        expect(findSubpackageByLocator("test", mockSubpackages)).toEqual({
            id: FdrAPI.api.v1.SubpackageId("test"),
            name: "test",
            displayName: "test"
        });
    });

    it("finds subpackage from yaml file", () => {
        expect(findSubpackageByLocator("test.yaml", mockSubpackages)).toEqual({
            id: FdrAPI.api.v1.SubpackageId("test"),
            name: "test",
            displayName: "test"
        });
        expect(findSubpackageByLocator("test.yml", mockSubpackages)).toEqual({
            id: FdrAPI.api.v1.SubpackageId("test"),
            name: "test",
            displayName: "test"
        });
    });
});

describe.skip("findEndpointByLocator", () => {
    const mockEndpoints = {
        [FdrAPI.EndpointId("getUser")]: {
            id: FdrAPI.EndpointId("getUser"),
            method: "GET" as const,
            path: [],
            displayName: "Get User",
            operationId: "getUser",
            auth: [],
            environments: [],
            defaultEnvironment: FdrAPI.EnvironmentId("defaultEnvironment"),
            description: "description",
            availability: undefined,
            namespace: [],
            pathParameters: [],
            queryParameters: [],
            requestHeaders: [],
            responseHeaders: [],
            examples: [],
            requests: [],
            responses: [],
            errors: [],
            snippetTemplates: undefined
        }
    };

    it("finds endpoint by id", () => {
        expect(findEndpointByLocator("getUser", mockEndpoints)).toBeDefined();
    });

    it("finds endpoint by path and method", () => {
        expect(findEndpointByLocator("GET /users/:id", mockEndpoints)).toBeDefined();
        expect(findEndpointByLocator("GET /users/{id}", mockEndpoints)).toBeDefined();
    });
});

describe.skip("findWebSocketByLocator", () => {
    const mockWebsockets = {
        [FdrAPI.WebSocketId("userStream")]: {
            id: FdrAPI.WebSocketId("userStream"),
            path: [],
            displayName: "User Stream",
            auth: [],
            pathParameters: [],
            queryParameters: [],
            requestHeaders: [],
            messages: [],
            examples: [],
            description: "description",
            availability: undefined,
            namespace: [],
            operationId: "userStream",
            environments: [],
            defaultEnvironment: FdrAPI.EnvironmentId("defaultEnvironment"),
        }
    };

    it("finds websocket by id", () => {
        expect(findWebSocketByLocator("userStream", mockWebsockets)).toBeDefined();
    });

    it("finds websocket by path", () => {
        expect(findWebSocketByLocator("STREAM /users/stream", mockWebsockets)).toBeDefined();
    });
});

describe.skip("findWebhookByLocator", () => {
    const mockWebhooks = {
        [FdrAPI.WebhookId("userCreated")]: {
            id: FdrAPI.WebhookId("userCreated"),
            method: "POST" as const,
            path: ["webhooks", "user-created"],
            displayName: "User Created",
            headers: [],
            payloads: [],
            examples: [],
            description: "description",
            availability: undefined,
            namespace: [],
            operationId: "userCreated",
        }
    };

    it("finds webhook by id", () => {
        expect(findWebhookByLocator("userCreated", mockWebhooks)).toBeDefined();
    });

    it("finds webhook by path and method", () => {
        expect(findWebhookByLocator("POST /webhooks/user-created", mockWebhooks)).toBeDefined();
    });
});