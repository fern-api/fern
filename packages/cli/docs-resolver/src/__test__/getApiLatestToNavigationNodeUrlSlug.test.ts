import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";

import { getApiLatestToNavigationNodeUrlSlug } from "../utils/getApiLatestToNavigationNodeUrlSlug";

it.skip("generates slug for endpoint", () => {
    const endpoint: FdrAPI.api.latest.endpoint.EndpointDefinition = {
        id: FdrAPI.EndpointId("endpoint_users.create"),
        namespace: [FdrAPI.api.v1.SubpackageId("apiService")],
        method: "POST",
        path: [
            {
                type: "literal",
                value: "/users"
            }
        ],
        displayName: "Create User",
        operationId: "createUser",
        description: "Create a new user",
        pathParameters: [],
        responses: [],
        queryParameters: [],
        requestHeaders: [],
        defaultEnvironment: undefined,
        environments: [],
        auth: [],
        responseHeaders: [],
        requests: [],
        errors: [],
        examples: [],
        snippetTemplates: undefined,
        protocol: undefined,
        availability: undefined,
        includeInApiExplorer: undefined
    };
    expect(
        getApiLatestToNavigationNodeUrlSlug({
            item: endpoint,
            parentSlug: FernNavigation.V1.SlugGenerator.init("")
        })
    ).toBe("api-service/create");
});

it.skip("generates slug for websocket", () => {
    const websocket: FdrAPI.api.latest.websocket.WebSocketChannel = {
        id: FdrAPI.WebSocketId("websocket_notifications.stream"),
        namespace: [FdrAPI.api.v1.SubpackageId("realtime")],
        displayName: "Notifications Stream",
        operationId: "notificationsStream",
        path: [
            {
                type: "literal",
                value: "/notifications/stream"
            }
        ],
        messages: [],
        defaultEnvironment: undefined,
        environments: [],
        auth: [],
        pathParameters: [],
        queryParameters: [],
        requestHeaders: [],
        examples: [],
        availability: undefined,
        description: undefined
    };
    expect(
        getApiLatestToNavigationNodeUrlSlug({
            item: websocket,
            parentSlug: FernNavigation.V1.SlugGenerator.init("")
        })
    ).toBe("realtime/stream");
});

it.skip("generates slug for webhook", () => {
    const webhook: FdrAPI.api.latest.webhook.WebhookDefinition = {
        id: FdrAPI.WebhookId("webhook_payment.completed"),
        namespace: [FdrAPI.api.v1.SubpackageId("webhooks")],
        displayName: "Payment Completed",
        operationId: "paymentCompleted",
        method: "POST",
        path: ["/path/completed"],
        examples: [],
        availability: undefined,
        headers: [],
        payloads: [],
        description: undefined
    };
    expect(
        getApiLatestToNavigationNodeUrlSlug({
            item: webhook,
            parentSlug: FernNavigation.V1.SlugGenerator.init("")
        })
    ).toBe("webhooks/completed");
});
