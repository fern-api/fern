import { kebabCase } from "lodash-es";

import { FdrAPI } from "@fern-api/fdr-sdk";

function getApiLatestToNavigationNodeUrlSlug<T extends { id: string; operationId?: string }>(item: T): string {
    return item.operationId != null ? kebabCase(item.operationId) : kebabCase(item.id.split(".").pop() ?? "");
}

export function getApiLatestEndpointToNavigationNodeUrlSlug(
    endpoint: FdrAPI.api.latest.endpoint.EndpointDefinition
): string {
    return getApiLatestToNavigationNodeUrlSlug(endpoint);
}

export function getApiLatestWebSocketToNavigationNodeUrlSlug(
    webSocket: FdrAPI.api.latest.websocket.WebSocketChannel
): string {
    return getApiLatestToNavigationNodeUrlSlug(webSocket);
}

export function getApiLatestWebhookToNavigationNodeUrlSlug(
    webhook: FdrAPI.api.latest.webhook.WebhookDefinition
): string {
    return getApiLatestToNavigationNodeUrlSlug(webhook);
}
