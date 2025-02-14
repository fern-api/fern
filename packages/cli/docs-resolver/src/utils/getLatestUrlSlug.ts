import { kebabCase } from "lodash-es";
import urlJoin from "url-join";

import { FdrAPI } from "@fern-api/fdr-sdk";

function getLatestUrlSlug<T extends { namespace?: string[]; id: string; operationId?: string }>(item: T): string {
    const slugParts = item.namespace?.map((subpackageId) => kebabCase(subpackageId.toString())) ?? [];
    slugParts.push(kebabCase(item.id.split(".").pop() ?? ""));
    return item.operationId != null ? kebabCase(item.operationId) : urlJoin(slugParts);
}

export function getLatestEndpointUrlSlug(endpoint: FdrAPI.api.latest.endpoint.EndpointDefinition): string {
    return getLatestUrlSlug(endpoint);
}

export function getLatestWebSocketUrlSlug(webSocket: FdrAPI.api.latest.websocket.WebSocketChannel): string {
    return getLatestUrlSlug(webSocket);
}

export function getLatestWebhookUrlSlug(webhook: FdrAPI.api.latest.webhook.WebhookDefinition): string {
    return getLatestUrlSlug(webhook);
}
