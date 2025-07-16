import { camelCase } from "lodash-es"
import urlJoin from "url-join"

import { FdrAPI } from "@fern-api/fdr-sdk"

import { getBasePath } from "./ApiDefinitionHolder"
import { stringifyEndpointPathParts, stringifyEndpointPathParts2 } from "./utils/stringifyEndpointPathParts"

export class ApiDefinitionHolderLatest {
    #subpackagesByLocator: Record<string, FdrAPI.api.latest.SubpackageMetadata> = {}
    #webhooksByLocator: Record<string, FdrAPI.api.latest.webhook.WebhookDefinition> = {}
    #endpointsByLocator: Record<string, FdrAPI.api.latest.endpoint.EndpointDefinition> = {}
    #websocketsByLocator: Record<string, FdrAPI.api.latest.websocket.WebSocketChannel> = {}

    constructor(api: FdrAPI.api.latest.ApiDefinition) {
        for (const [subpackageId, subpackage] of Object.entries(api.subpackages)) {
            this.#subpackagesByLocator[camelCase(subpackageId).toLowerCase()] = subpackage
            this.#subpackagesByLocator[`subpackage_${camelCase(subpackageId).toLowerCase()}`] = subpackage
        }

        for (const [endpointId, endpoint] of Object.entries(api.endpoints)) {
            this.#endpointsByLocator[endpointId] = endpoint
            this.#endpointsByLocator[endpointId.replace("endpoint_", "")] = endpoint
            this.#endpointsByLocator[endpointId.replace("endpoint_", "subpackage_")] = endpoint
            for (const method of [endpoint.method, "STREAM"]) {
                endpoint.environments?.forEach((environment) => {
                    this.#endpointsByLocator[
                        `${method} ${urlJoin(environment.baseUrl, stringifyEndpointPathParts(endpoint.path))}`
                    ] = endpoint
                    this.#endpointsByLocator[
                        `${method} ${urlJoin(environment.baseUrl, stringifyEndpointPathParts2(endpoint.path))}`
                    ] = endpoint
                    const basePath = getBasePath(environment)
                    if (basePath != null) {
                        this.#endpointsByLocator[
                            `${method} ${urlJoin(basePath, stringifyEndpointPathParts(endpoint.path))}`
                        ] = endpoint
                        this.#endpointsByLocator[
                            `${method} ${urlJoin(basePath, stringifyEndpointPathParts2(endpoint.path))}`
                        ] = endpoint
                    }
                })
                this.#endpointsByLocator[`${endpoint.method} ${stringifyEndpointPathParts(endpoint.path)}`] = endpoint
                this.#endpointsByLocator[`${endpoint.method} ${stringifyEndpointPathParts2(endpoint.path)}`] = endpoint
            }
        }
        for (const [webhookId, webhook] of Object.entries(api.webhooks)) {
            this.#webhooksByLocator[webhookId] = webhook
            this.#webhooksByLocator[webhookId.replace("webhook_", "")] = webhook
            this.#webhooksByLocator[webhookId.replace("webhook_", "subpackage_")] = webhook
            this.#webhooksByLocator[`${webhook.method} ${webhook.path.join("/")}`] = webhook
        }
        for (const [websocketId, websocket] of Object.entries(api.websockets)) {
            this.#websocketsByLocator[websocketId] = websocket
            this.#websocketsByLocator[websocketId.replace("websocket_", "")] = websocket
            this.#websocketsByLocator[websocketId.replace("websocket_", "subpackage_")] = websocket
            this.#websocketsByLocator[`STREAM ${stringifyEndpointPathParts(websocket.path)}`] = websocket
            this.#websocketsByLocator[`STREAM ${stringifyEndpointPathParts2(websocket.path)}`] = websocket
        }
    }

    getSubpackageByLocator(locator: string): FdrAPI.api.latest.SubpackageMetadata | undefined {
        if (
            ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "CONNECT", "TRACE"].some((method) =>
                locator.includes(method)
            )
        ) {
            return undefined
        }

        const subpackageId = locator.replace(".yml", "").replace(".yaml", "")
        return this.#subpackagesByLocator[subpackageId]
    }

    getWebhookByLocator(
        locator: string,
        packageId: string | undefined
    ): FdrAPI.api.latest.webhook.WebhookDefinition | undefined {
        return (
            this.#webhooksByLocator[locator] ??
            this.#webhooksByLocator[`${packageId}.${locator}`] ??
            this.#webhooksByLocator[`webhook_${packageId}.${locator}`]
        )
    }

    getEndpointByLocator(
        locator: string,
        packageId: string | undefined
    ): FdrAPI.api.latest.endpoint.EndpointDefinition | undefined {
        return (
            this.#endpointsByLocator[locator] ??
            this.#endpointsByLocator[`${packageId}.${locator}`] ??
            this.#endpointsByLocator[`endpoint_${packageId}.${locator}`]
        )
    }

    getWebSocketByLocator(
        locator: string,
        packageId: string | undefined
    ): FdrAPI.api.latest.websocket.WebSocketChannel | undefined {
        return (
            this.#websocketsByLocator[locator] ??
            this.#websocketsByLocator[`${packageId}.${locator}`] ??
            this.#websocketsByLocator[`websocket_${packageId}.${locator}`]
        )
    }

    get subpackageLocators(): ReadonlySet<string> {
        return new Set(Object.keys(this.#subpackagesByLocator))
    }
}
