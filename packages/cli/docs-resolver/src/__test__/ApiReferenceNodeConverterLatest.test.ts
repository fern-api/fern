/* eslint-disable jest/no-disabled-tests */
import { FdrAPI } from "@fern-api/fdr-sdk";

import {
    findEndpointByLocator,
    findSubpackageByLocator,
    findWebSocketByLocator,
    findWebhookByLocator,
    getOaiLocator
} from "../ApiReferenceNodeConverterLatest";

it.skip("converts path parameters correctly in getOaiLocator", () => {
    expect(getOaiLocator("/users/:id/posts/:postId")).toBe("/users/{id}/posts/{postId}");
    expect(getOaiLocator("/simple/path")).toBe("/simple/path");
    expect(getOaiLocator("/:param")).toBe("/{param}");
});

it.skip("finds subpackage by exact match", () => {
    const mockSubpackages = {
        [FdrAPI.api.v1.SubpackageId("test")]: {
            id: FdrAPI.api.v1.SubpackageId("test"),
            name: "test",
            displayName: "test"
        },
        [FdrAPI.api.v1.SubpackageId("nested.package")]: {
            id: FdrAPI.api.v1.SubpackageId("nested.package"),
            name: "nested",
            displayName: "nested"
        }
    };
    expect(findSubpackageByLocator("test", mockSubpackages)).toEqual({
        id: FdrAPI.api.v1.SubpackageId("test"),
        name: "test",
        displayName: "test"
    });
});

it.skip("finds subpackage from yaml/yml files", () => {
    const mockSubpackages = {
        [FdrAPI.api.v1.SubpackageId("test")]: {
            id: FdrAPI.api.v1.SubpackageId("test"),
            name: "test",
            displayName: "test"
        }
    };
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

it.skip("finds endpoint by id and by path/method", () => {
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
    expect(findEndpointByLocator("getUser", mockEndpoints)).toBeDefined();
    expect(findEndpointByLocator("GET /users/:id", mockEndpoints)).toBeDefined();
    expect(findEndpointByLocator("GET /users/{id}", mockEndpoints)).toBeDefined();
});

it.skip("finds websocket by id and by path", () => {
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
            defaultEnvironment: FdrAPI.EnvironmentId("defaultEnvironment")
        }
    };
    expect(findWebSocketByLocator("userStream", mockWebsockets)).toBeDefined();
    expect(findWebSocketByLocator("STREAM /users/stream", mockWebsockets)).toBeDefined();
});

it.skip("finds webhook by id and by path/method", () => {
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
            operationId: "userCreated"
        }
    };
    expect(findWebhookByLocator("userCreated", mockWebhooks)).toBeDefined();
    expect(findWebhookByLocator("POST /webhooks/user-created", mockWebhooks)).toBeDefined();
});
