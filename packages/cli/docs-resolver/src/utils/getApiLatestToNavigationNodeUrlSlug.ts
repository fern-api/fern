import { kebabCase } from "lodash-es";
import urlJoin from "url-join";

import { FdrAPI } from "@fern-api/fdr-sdk";

function getApiLatestToNavigationNodeUrlSlug<T extends { namespace?: string[]; id: string; operationId?: string }>(
    item: T
): string {
    const slugParts = item.namespace?.map((subpackageId) => kebabCase(subpackageId.toString())) ?? [];
    slugParts.push(kebabCase(item.id.split(".").pop() ?? ""));
    return item.operationId != null ? kebabCase(item.operationId) : urlJoin(slugParts);
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
