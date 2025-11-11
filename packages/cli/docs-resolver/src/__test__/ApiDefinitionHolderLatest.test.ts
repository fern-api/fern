import { FdrAPI } from "@fern-api/fdr-sdk";

import { ApiDefinitionHolderLatest } from "../ApiDefinitionHolderLatest";

it.skip("finds subpackage by exact match", () => {
    const apiDefinitionHolder = new ApiDefinitionHolderLatest({
        id: FdrAPI.ApiDefinitionId("test"),
        subpackages: {
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
        },
        endpoints: {},
        websockets: {},
        webhooks: {},
        types: {},
        auths: {},
        globalHeaders: [],
        snippetsConfiguration: undefined
    });
    expect(apiDefinitionHolder.getSubpackageByLocator("test")).toEqual({
        id: FdrAPI.api.v1.SubpackageId("test"),
        name: "test",
        displayName: "test"
    });
});

it.skip("finds subpackage from yaml/yml files", () => {
    const apiDefinitionHolder = new ApiDefinitionHolderLatest({
        id: FdrAPI.ApiDefinitionId("test"),
        subpackages: {
            [FdrAPI.api.v1.SubpackageId("test")]: {
                id: FdrAPI.api.v1.SubpackageId("test"),
                name: "test",
                displayName: "test"
            }
        },
        endpoints: {},
        websockets: {},
        webhooks: {},
        types: {},
        auths: {},
        globalHeaders: [],
        snippetsConfiguration: undefined
    });

    expect(apiDefinitionHolder.getSubpackageByLocator("test.yaml")).toEqual({
        id: FdrAPI.api.v1.SubpackageId("test"),
        name: "test",
        displayName: "test"
    });
    expect(apiDefinitionHolder.getSubpackageByLocator("test.yml")).toEqual({
        id: FdrAPI.api.v1.SubpackageId("test"),
        name: "test",
        displayName: "test"
    });
});

it.skip("finds endpoint by id and by path/method", () => {
    const apiDefinitionHolder = new ApiDefinitionHolderLatest({
        id: FdrAPI.ApiDefinitionId("test"),
        subpackages: {},
        endpoints: {
            [FdrAPI.EndpointId("getUser")]: {
                id: FdrAPI.EndpointId("getUser"),
                method: "GET" as const,
                path: [],
                displayName: "Get User",
                operationId: "getUser",
                auth: [],
                multiAuth: undefined,
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
                snippetTemplates: undefined,
                protocol: undefined,
                includeInApiExplorer: undefined
            }
        },
        websockets: {},
        webhooks: {},
        types: {},
        auths: {},
        globalHeaders: [],
        snippetsConfiguration: undefined
    });
    expect(apiDefinitionHolder.getEndpointByLocator("getUser", undefined)).toBeDefined();
    expect(apiDefinitionHolder.getEndpointByLocator("GET /users/:id", undefined)).toBeDefined();
    expect(apiDefinitionHolder.getEndpointByLocator("GET /users/{id}", undefined)).toBeDefined();
});

it.skip("finds websocket by id and by path", () => {
    const apiDefinitionHolder = new ApiDefinitionHolderLatest({
        id: FdrAPI.ApiDefinitionId("test"),
        subpackages: {},
        endpoints: {},
        websockets: {
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
        },
        webhooks: {},
        types: {},
        auths: {},
        globalHeaders: [],
        snippetsConfiguration: undefined
    });
    expect(apiDefinitionHolder.getWebSocketByLocator("userStream", undefined)).toBeDefined();
    expect(apiDefinitionHolder.getWebSocketByLocator("STREAM /users/stream", undefined)).toBeDefined();
});

it.skip("finds webhook by id and by path/method", () => {
    const apiDefinitionHolder = new ApiDefinitionHolderLatest({
        id: FdrAPI.ApiDefinitionId("test"),
        subpackages: {},
        endpoints: {},
        websockets: {},
        webhooks: {
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
        },
        types: {},
        auths: {},
        globalHeaders: [],
        snippetsConfiguration: undefined
    });
    expect(apiDefinitionHolder.getWebhookByLocator("userCreated", undefined)).toBeDefined();
    expect(apiDefinitionHolder.getWebhookByLocator("POST /webhooks/user-created", undefined)).toBeDefined();
});
