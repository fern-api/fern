import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import { camelCase } from "lodash-es";
import urlJoin from "url-join";

import { isSubpackage } from "./utils/isSubpackage";
import { stringifyEndpointPathParts, stringifyEndpointPathParts2 } from "./utils/stringifyEndpointPathParts";

// unlike `FernNavigation.EndpointId`, which concatenates the subpackageId and endpointId with a dot,
// SubpackageHolder is intended to help resolve the endpointId from within a subpackage.
export interface SubpackageHolder {
    readonly endpoints: ReadonlyMap<APIV1Read.EndpointId, APIV1Read.EndpointDefinition>;
    readonly webSockets: ReadonlyMap<APIV1Read.WebSocketId, APIV1Read.WebSocketChannel>;
    readonly webhooks: ReadonlyMap<APIV1Read.WebhookId, APIV1Read.WebhookDefinition>;
    readonly grpcs: ReadonlyMap<APIV1Read.GrpcId, APIV1Read.EndpointDefinition>;
}

export const ROOT_PACKAGE_ID = "__package__" as const;

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
    public static create(api: APIV1Read.ApiDefinition, context?: TaskContext): ApiDefinitionHolder {
        return new ApiDefinitionHolder(api, context);
    }

    #endpoints = new Map<FernNavigation.EndpointId, APIV1Read.EndpointDefinition>();
    #webSockets = new Map<FernNavigation.WebSocketId, APIV1Read.WebSocketChannel>();
    #webhooks = new Map<FernNavigation.WebhookId, APIV1Read.WebhookDefinition>();
    #grpcs = new Map<FernNavigation.GrpcId, APIV1Read.EndpointDefinition>();

    #endpointsInverted = new Map<APIV1Read.EndpointDefinition, FernNavigation.EndpointId>();
    #webSocketsInverted = new Map<APIV1Read.WebSocketChannel, FernNavigation.WebSocketId>();
    #webhooksInverted = new Map<APIV1Read.WebhookDefinition, FernNavigation.WebhookId>();
    #grpcsInverted = new Map<APIV1Read.EndpointDefinition, FernNavigation.GrpcId>();

    #subpackages = new Map<APIV1Read.SubpackageId, SubpackageHolder>();

    #endpointsByLocator = new Map<string, APIV1Read.EndpointDefinition>();
    #webSocketsByLocator = new Map<string, APIV1Read.WebSocketChannel>();
    #webhooksByLocator = new Map<string, APIV1Read.WebhookDefinition>();
    #grpcsByLocator = new Map<string, APIV1Read.EndpointDefinition>();

    #subpackagesByLocator = new Map<string, APIV1Read.ApiDefinitionPackage>();

    public static getSubpackageId(pkg: APIV1Read.ApiDefinitionPackage): string {
        return isSubpackage(pkg) ? pkg.subpackageId : ROOT_PACKAGE_ID;
    }

    public getSubpackageByIdOrLocator(subpackageIdRaw: string | undefined): APIV1Read.ApiDefinitionPackage | undefined {
        if (subpackageIdRaw == null) {
            return undefined;
        }
        const subpackageId = APIV1Read.SubpackageId(subpackageIdRaw);
        const fallbackSubpackageId = APIV1Read.SubpackageId(`subpackage_${camelCase(subpackageIdRaw)}`);
        if (subpackageId === ROOT_PACKAGE_ID) {
            return this.api.rootPackage;
        } else {
            return (
                this.api.subpackages[subpackageId] ??
                this.#subpackagesByLocator.get(subpackageId) ??
                this.api.subpackages[fallbackSubpackageId] ??
                this.#subpackagesByLocator.get(fallbackSubpackageId)
            );
        }
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

    private constructor(
        public readonly api: APIV1Read.ApiDefinition,
        private readonly context?: TaskContext
    ) {
        [api.rootPackage, ...Object.values(api.subpackages)].forEach((pkg) => {
            const subpackageId = APIV1Read.SubpackageId(ApiDefinitionHolder.getSubpackageId(pkg));
            const subpackageHolder = {
                endpoints: new Map<APIV1Read.EndpointId, APIV1Read.EndpointDefinition>(),
                webSockets: new Map<APIV1Read.WebSocketId, APIV1Read.WebSocketChannel>(),
                webhooks: new Map<APIV1Read.WebhookId, APIV1Read.WebhookDefinition>(),
                grpcs: new Map<APIV1Read.GrpcId, APIV1Read.EndpointDefinition>()
            };
            this.#subpackages.set(subpackageId, subpackageHolder);
            pkg.endpoints.forEach((endpoint) => {
                if (endpoint.protocol?.type === "grpc") {
                    subpackageHolder.grpcs.set(endpoint.id as unknown as APIV1Read.GrpcId, endpoint);
                    const grpcId = ApiDefinitionHolder.createGrpcId(endpoint, subpackageId);
                    this.#grpcs.set(grpcId, endpoint);
                } else {
                    subpackageHolder.endpoints.set(endpoint.id, endpoint);
                    const endpointId = ApiDefinitionHolder.createEndpointId(endpoint, subpackageId);
                    this.#endpoints.set(endpointId, endpoint);
                    const locators: string[] = [];

                    const methods: string[] = [endpoint.method];

                    if (endpoint.response?.type.type === "stream") {
                        methods.push("STREAM");
                    }

                    methods.forEach((method) => {
                        locators.push(`${method} ${stringifyEndpointPathParts(endpoint.path.parts)}`);
                        locators.push(`${method} ${stringifyEndpointPathParts2(endpoint.path.parts)}`);

                        endpoint.environments.forEach((environment) => {
                            locators.push(
                                `${method} ${urlJoin(environment.baseUrl, stringifyEndpointPathParts(endpoint.path.parts))}`
                            );
                            locators.push(
                                `${method} ${urlJoin(
                                    environment.baseUrl,
                                    stringifyEndpointPathParts2(endpoint.path.parts)
                                )}`
                            );
                            const basePath = getBasePath(environment);
                            if (basePath != null) {
                                locators.push(
                                    `${method} ${urlJoin(basePath, stringifyEndpointPathParts(endpoint.path.parts))}`
                                );
                                locators.push(
                                    `${method} ${urlJoin(basePath, stringifyEndpointPathParts2(endpoint.path.parts))}`
                                );
                            }
                        });
                    });

                    locators.forEach((locator) => {
                        this.context?.logger.trace(`Registering endpoint locator: ${locator}`);
                        this.#endpointsByLocator.set(locator, endpoint);
                    });
                }
            });
            pkg.websockets.forEach((webSocket) => {
                subpackageHolder.webSockets.set(webSocket.id, webSocket);
                const webSocketId = ApiDefinitionHolder.createWebSocketId(webSocket, subpackageId);
                this.#webSockets.set(webSocketId, webSocket);

                const locators: string[] = [];
                const methods: string[] = ["GET", "WSS"];

                methods.forEach((method) => {
                    locators.push(`${method} ${stringifyEndpointPathParts(webSocket.path.parts)}`);
                    locators.push(`${method} ${stringifyEndpointPathParts2(webSocket.path.parts)}`);

                    webSocket.environments.forEach((environment) => {
                        locators.push(
                            `${method} ${urlJoin(
                                environment.baseUrl,
                                stringifyEndpointPathParts(webSocket.path.parts)
                            )}`
                        );
                        locators.push(
                            `${method} ${urlJoin(
                                environment.baseUrl,
                                stringifyEndpointPathParts2(webSocket.path.parts)
                            )}`
                        );
                        const basePath = getBasePath(environment);
                        if (basePath != null) {
                            locators.push(
                                `${method} ${urlJoin(basePath, stringifyEndpointPathParts(webSocket.path.parts))}`
                            );
                            locators.push(
                                `${method} ${urlJoin(basePath, stringifyEndpointPathParts2(webSocket.path.parts))}`
                            );
                        }
                    });
                });

                locators.forEach((locator) => {
                    this.context?.logger.trace(`Registering websocket locator: ${locator}`);
                    this.#webSocketsByLocator.set(locator, webSocket);
                });
            });
            pkg.webhooks.forEach((webhook) => {
                subpackageHolder.webhooks.set(webhook.id, webhook);
                this.#webhooks.set(ApiDefinitionHolder.createWebhookId(webhook, subpackageId), webhook);

                // webhooks don't have paths, so we just register them by their ID in a later step
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
        this.#grpcs.forEach((grpc, grpcId) => {
            this.#grpcsInverted.set(grpc, grpcId);
        });

        this.#constructSubpackageLocators(api.rootPackage, []);
    }

    #constructSubpackageLocators(pkg: APIV1Read.ApiDefinitionPackage | undefined, parents: string[]): void {
        if (pkg == null) {
            return;
        }

        const packageList = isSubpackage(pkg) ? [...parents, pkg.name] : parents;

        const path = packageList.length === 0 ? [ROOT_PACKAGE_ID] : packageList;
        const locators = [path.join("."), path.join("/"), `${path.join(".")}.yml`];
        locators.forEach((locator) => {
            this.context?.logger.trace(`Registering subpackage locator: ${locator}`);
            this.#subpackagesByLocator.set(locator, pkg);
        });

        if (pkg.pointsTo != null) {
            return this.#constructSubpackageLocators(this.api.subpackages[pkg.pointsTo], packageList);
        }

        pkg.endpoints.forEach((endpoint) => {
            // TODO
            if (endpoint.protocol?.type === "grpc") {
                return;
            }
            const path = [...packageList, endpoint.id];
            const locators = [path.join("."), path.join("/")];
            locators.forEach((locator) => {
                this.context?.logger.trace(`Registering endpoint locator: ${locator}`);
                this.#endpointsByLocator.set(locator, endpoint);
            });
        });

        pkg.websockets.forEach((webSocket) => {
            const path = [...packageList, webSocket.id];
            const locators = [path.join("."), path.join("/")];
            locators.forEach((locator) => {
                this.context?.logger.trace(`Registering websocket locator: ${locator}`);
                this.#webSocketsByLocator.set(locator, webSocket);
            });
        });

        pkg.webhooks.forEach((webhook) => {
            const path = [...packageList, webhook.id];
            const locators = [path.join("."), path.join("/")];
            locators.forEach((locator) => {
                this.context?.logger.trace(`Registering webhook locator: ${locator}`);
                this.#webhooksByLocator.set(locator, webhook);
            });
        });

        pkg.subpackages.forEach((subpackageId) => {
            this.#constructSubpackageLocators(this.api.subpackages[subpackageId], packageList);
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

    get grpcs(): ReadonlyMap<FernNavigation.GrpcId, APIV1Read.EndpointDefinition> {
        return this.#grpcs;
    }

    get endpointsByLocator(): ReadonlyMap<string, APIV1Read.EndpointDefinition> {
        return this.#endpointsByLocator;
    }

    get webSocketsByLocator(): ReadonlyMap<string, APIV1Read.WebSocketChannel> {
        return this.#webSocketsByLocator;
    }

    get webhooksByLocator(): ReadonlyMap<string, APIV1Read.WebhookDefinition> {
        return this.#webhooksByLocator;
    }

    get grpcsByLocator(): ReadonlyMap<string, APIV1Read.EndpointDefinition> {
        return this.#grpcsByLocator;
    }

    get subpackages(): ReadonlyMap<APIV1Read.SubpackageId, SubpackageHolder> {
        return this.#subpackages;
    }

    get subpackagesByLocator(): ReadonlyMap<string, APIV1Read.ApiDefinitionPackage> {
        return this.#subpackagesByLocator;
    }

    get subpackageLocators(): ReadonlySet<string> {
        return new Set(this.#subpackagesByLocator.keys());
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

    public getGrpcId(grpc: APIV1Read.EndpointDefinition): FernNavigation.GrpcId | undefined {
        return this.#grpcsInverted.get(grpc);
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

    public static createGrpcId(grpc: APIV1Read.EndpointDefinition, subpackageId: string): FernNavigation.GrpcId {
        return FernNavigation.GrpcId(`${subpackageId}.${grpc.id}`);
    }
}

export function getBasePath(environment: APIV1Read.Environment | undefined): string | undefined {
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
