import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import urlJoin from "url-join";
import { isSubpackage } from "./utils/isSubpackage";
import { stringifyEndpointPathParts, stringifyEndpointPathParts2 } from "./utils/stringifyEndpointPathParts";

// unlike `FernNavigation.EndpointId`, which concatenates the subpackageId and endpointId with a dot,
// SubpackageHolder is intended to help resolve the endpointId from within a subpackage.
export interface SubpackageHolder {
    readonly endpoints: ReadonlyMap<APIV1Read.EndpointId, APIV1Read.EndpointDefinition>;
    readonly webSockets: ReadonlyMap<APIV1Read.WebSocketId, APIV1Read.WebSocketChannel>;
    readonly webhooks: ReadonlyMap<APIV1Read.WebhookId, APIV1Read.WebhookDefinition>;
}

const ROOT_PACKAGE_ID = "root" as const;

/**
 * A holder for an API definition, which provides a way to resolve endpoint, websocket, and webhook IDs.
 * This class is intended to be used in the ApiReferenceNodeConverter, which is responsible for resolving
 * endpoint references such as:
 *
 *  - `GET /users/{userId}`
 *
 * into the corresponding endpoint definition, when constructing the API reference tree.
 */
export class ApiDefinitionHolder {
    public static create(api: APIV1Read.ApiDefinition): ApiDefinitionHolder {
        return new ApiDefinitionHolder(api);
    }

    #endpoints = new Map<FernNavigation.EndpointId, APIV1Read.EndpointDefinition>();
    #webSockets = new Map<FernNavigation.WebSocketId, APIV1Read.WebSocketChannel>();
    #webhooks = new Map<FernNavigation.WebhookId, APIV1Read.WebhookDefinition>();
    #endpointsInverted = new Map<APIV1Read.EndpointDefinition, FernNavigation.EndpointId>();
    #webSocketsInverted = new Map<APIV1Read.WebSocketChannel, FernNavigation.WebSocketId>();
    #webhooksInverted = new Map<APIV1Read.WebhookDefinition, FernNavigation.WebhookId>();
    #subpackages = new Map<APIV1Read.SubpackageId, SubpackageHolder>();

    #endpointsByPath = new Map<string, APIV1Read.EndpointDefinition>();
    #webSocketsByPath = new Map<string, APIV1Read.WebSocketChannel>();
    // #webhooksByPath = new Map<string, APIV1Read.WebhookDefinition>();

    public static getSubpackageId(pkg: APIV1Read.ApiDefinitionPackage): string {
        return isSubpackage(pkg) ? pkg.subpackageId : ROOT_PACKAGE_ID;
    }

    public getSubpackage(subpackageId: string): APIV1Read.ApiDefinitionPackage | undefined {
        return subpackageId === ROOT_PACKAGE_ID
            ? this.api.rootPackage
            : this.api.subpackages[
                  subpackageId.startsWith("subpackage_") ? subpackageId : `subpackage_${subpackageId}`
              ];
    }

    public resolveSubpackage(
        pkg: APIV1Read.ApiDefinitionPackage | undefined
    ): APIV1Read.ApiDefinitionPackage | undefined {
        if (pkg == null) {
            return undefined;
        }
        while (pkg?.pointsTo != null) {
            pkg = this.api.subpackages[pkg.pointsTo];
        }
        return pkg;
    }

    private constructor(public readonly api: APIV1Read.ApiDefinition) {
        [api.rootPackage, ...Object.values(api.subpackages)].forEach((pkg) => {
            const subpackageId = ApiDefinitionHolder.getSubpackageId(pkg);
            const subpackageHolder = {
                endpoints: new Map<APIV1Read.EndpointId, APIV1Read.EndpointDefinition>(),
                webSockets: new Map<APIV1Read.WebSocketId, APIV1Read.WebSocketChannel>(),
                webhooks: new Map<APIV1Read.WebhookId, APIV1Read.WebhookDefinition>()
            };
            this.#subpackages.set(subpackageId, subpackageHolder);
            pkg.endpoints.forEach((endpoint) => {
                subpackageHolder.endpoints.set(endpoint.id, endpoint);
                this.#endpoints.set(ApiDefinitionHolder.createEndpointId(endpoint, subpackageId), endpoint);
                this.#endpointsByPath.set(
                    `${endpoint.method} ${stringifyEndpointPathParts(endpoint.path.parts)}`,
                    endpoint
                );
                this.#endpointsByPath.set(
                    `${endpoint.method} ${stringifyEndpointPathParts2(endpoint.path.parts)}`,
                    endpoint
                );
                endpoint.environments.forEach((environment) => {
                    this.#endpointsByPath.set(
                        `${endpoint.method} ${urlJoin(
                            environment.baseUrl,
                            stringifyEndpointPathParts(endpoint.path.parts)
                        )}`,
                        endpoint
                    );
                    this.#endpointsByPath.set(
                        `${endpoint.method} ${urlJoin(
                            environment.baseUrl,
                            stringifyEndpointPathParts2(endpoint.path.parts)
                        )}`,
                        endpoint
                    );
                    const basePath = getBasePath(environment);
                    if (basePath != null) {
                        this.#endpointsByPath.set(
                            `${endpoint.method} ${urlJoin(basePath, stringifyEndpointPathParts(endpoint.path.parts))}`,
                            endpoint
                        );
                        this.#endpointsByPath.set(
                            `${endpoint.method} ${urlJoin(basePath, stringifyEndpointPathParts2(endpoint.path.parts))}`,
                            endpoint
                        );
                    }
                });
            });
            pkg.websockets.forEach((webSocket) => {
                subpackageHolder.webSockets.set(webSocket.id, webSocket);
                this.#webSockets.set(ApiDefinitionHolder.createWebSocketId(webSocket, subpackageId), webSocket);

                // websockets are always GET.
                // TODO: should we resolve without the GET method?
                this.#webSocketsByPath.set(`GET ${stringifyEndpointPathParts(webSocket.path.parts)}`, webSocket);
                this.#webSocketsByPath.set(`GET ${stringifyEndpointPathParts2(webSocket.path.parts)}`, webSocket);
                webSocket.environments.forEach((environment) => {
                    this.#webSocketsByPath.set(
                        `GET ${urlJoin(environment.baseUrl, stringifyEndpointPathParts(webSocket.path.parts))}`,
                        webSocket
                    );
                    this.#webSocketsByPath.set(
                        `GET ${urlJoin(environment.baseUrl, stringifyEndpointPathParts2(webSocket.path.parts))}`,
                        webSocket
                    );
                    const basePath = getBasePath(environment);
                    if (basePath != null) {
                        this.#webSocketsByPath.set(
                            `GET ${urlJoin(basePath, stringifyEndpointPathParts(webSocket.path.parts))}`,
                            webSocket
                        );
                        this.#webSocketsByPath.set(
                            `GET ${urlJoin(basePath, stringifyEndpointPathParts2(webSocket.path.parts))}`,
                            webSocket
                        );
                    }
                });
            });
            pkg.webhooks.forEach((webhook) => {
                subpackageHolder.webhooks.set(webhook.id, webhook);
                this.#webhooks.set(ApiDefinitionHolder.createWebhookId(webhook, subpackageId), webhook);
                // TODO: Implement webhook path resolution
            });
        });

        this.#endpoints.forEach((endpoint, endpointId) => {
            this.#endpointsInverted.set(endpoint, endpointId);
        });
        this.#webSockets.forEach((webSocket, webSocketId) => {
            this.#webSocketsInverted.set(webSocket, webSocketId);
        });
        this.#webhooks.forEach((webhook, webhookId) => {
            this.#webhooksInverted.set(webhook, webhookId);
        });
    }

    get endpoints(): ReadonlyMap<FernNavigation.EndpointId, APIV1Read.EndpointDefinition> {
        return this.#endpoints;
    }

    get webSockets(): ReadonlyMap<FernNavigation.WebSocketId, APIV1Read.WebSocketChannel> {
        return this.#webSockets;
    }

    get webhooks(): ReadonlyMap<FernNavigation.WebhookId, APIV1Read.WebhookDefinition> {
        return this.#webhooks;
    }

    get endpointsByPath(): ReadonlyMap<string, APIV1Read.EndpointDefinition> {
        return this.#endpointsByPath;
    }

    get webSocketsByPath(): ReadonlyMap<string, APIV1Read.WebSocketChannel> {
        return this.#webSocketsByPath;
    }

    get subpackages(): ReadonlyMap<APIV1Read.SubpackageId, SubpackageHolder> {
        return this.#subpackages;
    }

    public getEndpointId(endpoint: APIV1Read.EndpointDefinition): FernNavigation.EndpointId | undefined {
        return this.#endpointsInverted.get(endpoint);
    }

    public getWebSocketId(webSocket: APIV1Read.WebSocketChannel): FernNavigation.WebSocketId | undefined {
        return this.#webSocketsInverted.get(webSocket);
    }

    public getWebhookId(webhook: APIV1Read.WebhookDefinition): FernNavigation.WebhookId | undefined {
        return this.#webhooksInverted.get(webhook);
    }

    // get webhooksByPath(): ReadonlyMap<string, APIV1Read.WebhookDefinition> {
    //     return this.#webhooksByPath;
    // }

    public static createEndpointId(
        endpoint: APIV1Read.EndpointDefinition,
        subpackageId: string
    ): FernNavigation.EndpointId {
        return FernNavigation.EndpointId(endpoint.originalEndpointId ?? `${subpackageId}.${endpoint.id}`);
    }

    public static createWebSocketId(
        webSocket: APIV1Read.WebSocketChannel,
        subpackageId: string
    ): FernNavigation.WebSocketId {
        return FernNavigation.WebSocketId(`${subpackageId}.${webSocket.id}`);
    }

    public static createWebhookId(
        webhook: APIV1Read.WebhookDefinition,
        subpackageId: string
    ): FernNavigation.WebhookId {
        return FernNavigation.WebhookId(`${subpackageId}.${webhook.id}`);
    }
}

function getBasePath(environment: APIV1Read.Environment | undefined): string | undefined {
    if (environment == null) {
        return undefined;
    }

    if (environment.baseUrl.startsWith("/")) {
        return environment.baseUrl;
    }

    if (environment.baseUrl.startsWith("http") || environment.baseUrl.startsWith("ws")) {
        try {
            return new URL(environment.baseUrl).pathname;
        } catch (e) {
            return undefined;
        }
    }
    return undefined;
}
