import { kebabCase } from "lodash-es";
import urlJoin from "url-join";

import { docsYml } from "@fern-api/configuration-loader";
import { isNonNullish } from "@fern-api/core-utils";
import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { titleCase, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { DocsWorkspace } from "@fern-api/workspace-loader";

import { ApiDefinitionHolderLatest } from "./ApiDefinitionHolderLatest";
import { ChangelogNodeConverter } from "./ChangelogNodeConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { convertPlaygroundSettings } from "./utils/convertPlaygroundSettings";
import { enrichApiPackageChild } from "./utils/enrichApiPackageChild";
import {
    getApiLatestEndpointToNavigationNodeUrlSlug,
    getApiLatestWebSocketToNavigationNodeUrlSlug,
    getApiLatestWebhookToNavigationNodeUrlSlug
} from "./utils/getApiLatestToNavigationNodeUrlSlug";
import { mergeAndFilterChildren } from "./utils/mergeAndFilterChildren";
import { mergeEndpointPairs } from "./utils/mergeEndpointPairs";
import { stringifyEndpointPathParts } from "./utils/stringifyEndpointPathParts";
import { toPageNode } from "./utils/toPageNode";
import { toRelativeFilepath } from "./utils/toRelativeFilepath";

export class ApiReferenceNodeConverterLatest {
    apiDefinitionId: FernNavigation.V1.ApiDefinitionId;
    #api: FdrAPI.api.latest.ApiDefinition;
    #apiDefinitionHolder: ApiDefinitionHolderLatest;
    #visitedEndpoints = new Set<FernNavigation.V1.EndpointId>();
    #visitedWebSockets = new Set<FernNavigation.V1.WebSocketId>();
    #visitedWebhooks = new Set<FernNavigation.V1.WebhookId>();
    #visitedSubpackages = new Set<string>();
    #nodeIdToSubpackageId = new Map<string, string[]>();
    #children: FernNavigation.V1.ApiPackageChild[] = [];
    #overviewPageId: FernNavigation.V1.PageId | undefined;
    #slug: FernNavigation.V1.SlugGenerator;
    #idgen: NodeIdGenerator;
    #topLevelSubpackages: Map<string, FdrAPI.navigation.v1.ApiPackageNode> = new Map();
    private disableEndpointPairs;
    constructor(
        private apiSection: docsYml.DocsNavigationItem.ApiSection,
        api: FdrAPI.api.latest.ApiDefinition,
        parentSlug: FernNavigation.V1.SlugGenerator,
        private workspace: OSSWorkspace | undefined,
        private docsWorkspace: DocsWorkspace,
        private taskContext: TaskContext,
        private markdownFilesToFullSlugs: Map<AbsoluteFilePath, string>,
        idgen: NodeIdGenerator
    ) {
        this.#api = api;
        this.#apiDefinitionHolder = new ApiDefinitionHolderLatest(api);
        this.disableEndpointPairs = docsWorkspace.config.experimental?.disableStreamToggle ?? false;
        this.apiDefinitionId = FernNavigation.V1.ApiDefinitionId(api.id);

        // we are assuming that the apiDefinitionId is unique.
        this.#idgen = idgen;

        this.#overviewPageId =
            this.apiSection.overviewAbsolutePath != null
                ? FernNavigation.V1.PageId(toRelativeFilepath(this.docsWorkspace, this.apiSection.overviewAbsolutePath))
                : undefined;

        // the overview page markdown could contain a full slug, which would be used as the base slug for the API section.
        const maybeFullSlug =
            this.apiSection.overviewAbsolutePath != null
                ? this.markdownFilesToFullSlugs.get(this.apiSection.overviewAbsolutePath)
                : undefined;

        this.#slug = parentSlug.apply({
            fullSlug: maybeFullSlug?.split("/"),
            skipUrlSlug: this.apiSection.skipUrlSlug,
            urlSlug: this.apiSection.slug ?? kebabCase(this.apiSection.title)
        });

        // Step 1. Convert the navigation items that are manually defined in the API section.
        if (this.apiSection.navigation != null) {
            this.#children = this.#convertApiReferenceLayoutItems(this.apiSection.navigation, undefined, this.#slug);
        }

        // Step 2. Fill in the any missing navigation items from the API definition
        this.#children = this.#mergeAndFilterChildren(
            this.#children.map((child) => this.#enrichApiPackageChild(child)),
            this.#convertApiDefinitionPackage(this.#api, this.#slug)
        );
    }

    public get(): FernNavigation.V1.ApiReferenceNode {
        const pointsTo = FernNavigation.V1.followRedirects(this.#children);
        const changelogNodeConverter = new ChangelogNodeConverter(
            this.markdownFilesToFullSlugs,
            this.workspace?.changelog?.files.map((file) => file.absoluteFilepath),
            this.docsWorkspace,
            this.#idgen
        ).orUndefined();
        return {
            id: this.#idgen.get(this.apiDefinitionId),
            type: "apiReference",
            title: this.apiSection.title,
            apiDefinitionId: this.apiDefinitionId,
            overviewPageId: this.#overviewPageId,
            paginated: this.apiSection.paginated,
            slug: this.#slug.get(),
            icon: this.apiSection.icon,
            hidden: this.apiSection.hidden,
            hideTitle: this.apiSection.flattened,
            showErrors: this.apiSection.showErrors,
            changelog: changelogNodeConverter?.toChangelogNode({
                parentSlug: this.#slug,
                viewers: undefined
            }),
            children: this.#children,
            availability: undefined,
            pointsTo,
            noindex: undefined,
            playground: this.#convertPlaygroundSettings(this.apiSection.playground),
            authed: undefined,
            viewers: this.apiSection.viewers,
            orphaned: this.apiSection.orphaned,
            featureFlags: this.apiSection.featureFlags
        };
    }

    // Step 1

    #convertApiReferenceLayoutItems(
        navigation: docsYml.ParsedApiReferenceLayoutItem[],
        apiDefinitionPackageId: string | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageChild[] {
        return navigation
            .map((item) =>
                visitDiscriminatedUnion(item)._visit<FernNavigation.V1.ApiPackageChild | undefined>({
                    link: (link) => ({
                        id: this.#idgen.get(link.url),
                        type: "link",
                        title: link.text,
                        icon: link.icon,
                        url: FernNavigation.Url(link.url)
                    }),
                    page: (page) => this.#toPageNode(page, parentSlug),
                    package: (pkg) => this.#convertPackage(pkg, parentSlug),
                    section: (section) => this.#convertSection(section, parentSlug),
                    item: ({ value: unknownIdentifier }): FernNavigation.V1.ApiPackageChild | undefined =>
                        this.#convertUnknownIdentifier(unknownIdentifier, apiDefinitionPackageId, parentSlug),
                    endpoint: (endpoint) => this.#convertEndpoint(endpoint, apiDefinitionPackageId, parentSlug)
                })
            )
            .filter(isNonNullish);
    }

    #toPageNode(
        page: docsYml.DocsNavigationItem.Page,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.PageNode {
        return toPageNode({
            docsWorkspace: this.docsWorkspace,
            page,
            parentSlug,
            idgen: this.#idgen,
            markdownFilesToFullSlugs: this.markdownFilesToFullSlugs
        });
    }

    #convertPackage(
        pkg: docsYml.ParsedApiReferenceLayoutItem.Package,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageNode {
        const overviewPageId =
            pkg.overviewAbsolutePath != null
                ? FernNavigation.V1.PageId(toRelativeFilepath(this.docsWorkspace, pkg.overviewAbsolutePath))
                : undefined;

        const maybeFullSlug =
            pkg.overviewAbsolutePath != null ? this.markdownFilesToFullSlugs.get(pkg.overviewAbsolutePath) : undefined;

        const subpackage = this.#apiDefinitionHolder.getSubpackageByLocator(pkg.package);

        if (subpackage != null) {
            const subpackageNodeId = this.#idgen.get(overviewPageId ?? `${this.apiDefinitionId}:${subpackage.id}`);

            if (this.#visitedSubpackages.has(subpackage.id)) {
                this.taskContext.logger.error(
                    `Duplicate subpackage found in the API Reference layout: ${subpackage.id}`
                );
            }

            this.#visitedSubpackages.add(subpackage.id);
            this.#nodeIdToSubpackageId.set(subpackageNodeId, [subpackage.id]);
            const urlSlug = pkg.slug ?? subpackage.name;
            const slug = parentSlug.apply({
                fullSlug: maybeFullSlug?.split("/"),
                skipUrlSlug: pkg.skipUrlSlug,
                urlSlug
            });
            const convertedItems = this.#convertApiReferenceLayoutItems(pkg.contents, subpackage.id, slug);
            const subpackageNode: FernNavigation.V1.ApiPackageNode = {
                id: subpackageNodeId,
                type: "apiPackage",
                children: convertedItems,
                title: pkg.title ?? subpackage.displayName ?? titleCase(subpackage.name),
                slug: slug.get(),
                icon: pkg.icon,
                hidden: pkg.hidden,
                overviewPageId,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined,
                noindex: undefined,
                playground: this.#convertPlaygroundSettings(pkg.playground),
                authed: undefined,
                viewers: pkg.viewers,
                orphaned: pkg.orphaned,
                featureFlags: pkg.featureFlags
            };

            this.#topLevelSubpackages.set(subpackage.id, subpackageNode);
            return subpackageNode;
        } else {
            this.taskContext.logger.warn(
                `Subpackage ${pkg.package} not found in ${this.apiDefinitionId}, treating it as a section`
            );
            const urlSlug = pkg.slug ?? kebabCase(pkg.package);
            const slug = parentSlug.apply({
                fullSlug: maybeFullSlug?.split("/"),
                skipUrlSlug: pkg.skipUrlSlug,
                urlSlug
            });
            const convertedItems = this.#convertApiReferenceLayoutItems(pkg.contents, pkg.package, slug);
            const sectionNode: FernNavigation.V1.ApiPackageNode = {
                id: this.#idgen.get(overviewPageId ?? `${this.apiDefinitionId}:${kebabCase(pkg.package)}`),
                type: "apiPackage",
                children: convertedItems,
                title: pkg.title ?? pkg.package,
                slug: slug.get(),
                icon: pkg.icon,
                hidden: pkg.hidden,
                overviewPageId,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined,
                noindex: undefined,
                playground: this.#convertPlaygroundSettings(pkg.playground),
                authed: undefined,
                viewers: pkg.viewers,
                orphaned: pkg.orphaned,
                featureFlags: pkg.featureFlags
            };

            this.#topLevelSubpackages.set(pkg.package, sectionNode);
            return sectionNode;
        }
    }

    #convertSection(
        section: docsYml.ParsedApiReferenceLayoutItem.Section,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageNode {
        const overviewPageId =
            section.overviewAbsolutePath != null
                ? FernNavigation.V1.PageId(toRelativeFilepath(this.docsWorkspace, section.overviewAbsolutePath))
                : undefined;

        const maybeFullSlug =
            section.overviewAbsolutePath != null
                ? this.markdownFilesToFullSlugs.get(section.overviewAbsolutePath)
                : undefined;

        const nodeId = this.#idgen.get(overviewPageId ?? maybeFullSlug ?? parentSlug.get());

        const subpackageIds = section.referencedSubpackages
            .map((locator) => {
                const subpackage = this.#apiDefinitionHolder.getSubpackageByLocator(locator);

                return subpackage != null ? subpackage.id : undefined;
            })
            .filter((subpackageId) => {
                if (subpackageId == null) {
                    this.taskContext.logger.error(`Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`);
                }
                return subpackageId != null;
            })
            .filter(isNonNullish);

        this.#nodeIdToSubpackageId.set(nodeId, subpackageIds);
        subpackageIds.forEach((subpackageId) => {
            if (this.#visitedSubpackages.has(subpackageId)) {
                this.taskContext.logger.error(
                    `Duplicate subpackage found in the API Reference layout: ${subpackageId}`
                );
            }

            this.#visitedSubpackages.add(subpackageId);
        });

        const urlSlug = section.slug ?? kebabCase(section.title);
        const slug = parentSlug.apply({
            fullSlug: maybeFullSlug?.split("/"),
            skipUrlSlug: section.skipUrlSlug,
            urlSlug
        });
        const convertedItems = this.#convertApiReferenceLayoutItems(section.contents, section.title, slug);
        const sectionNode: FernNavigation.V1.ApiPackageNode = {
            id: nodeId,
            type: "apiPackage",
            children: convertedItems,
            title: section.title,
            slug: slug.get(),
            icon: section.icon,
            hidden: section.hidden,
            overviewPageId,
            availability: undefined,
            apiDefinitionId: this.apiDefinitionId,
            pointsTo: undefined,
            noindex: undefined,
            playground: this.#convertPlaygroundSettings(section.playground),
            authed: undefined,
            viewers: section.viewers,
            orphaned: section.orphaned,
            featureFlags: section.featureFlags
        };

        subpackageIds.forEach((subpackageId) => {
            this.#topLevelSubpackages.set(subpackageId, sectionNode);
        });

        return sectionNode;
    }

    #convertUnknownIdentifier(
        unknownIdentifier: string,
        apiDefinitionPackageId: string | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageChild | undefined {
        unknownIdentifier = unknownIdentifier.trim();
        // unknownIdentifier could either be a package, endpoint, websocket, or webhook.
        // We need to determine which one it is.

        // if the unknownIdentifier is a subpackage, we need to check subpackage metadata, and any locators (strip .yml)

        const subpackage = this.#apiDefinitionHolder.getSubpackageByLocator(unknownIdentifier);

        if (subpackage != null) {
            const subpackageId = subpackage.id;
            const subpackageNodeId = this.#idgen.get(`${this.apiDefinitionId}:${subpackageId}`);

            if (this.#visitedSubpackages.has(subpackageId)) {
                this.taskContext.logger.error(
                    `Duplicate subpackage found in the API Reference layout: ${subpackageId}`
                );
            }

            this.#visitedSubpackages.add(subpackageId);
            this.#nodeIdToSubpackageId.set(subpackageNodeId, [subpackageId]);
            const urlSlug = kebabCase(subpackage.name);
            const slug = parentSlug.apply({ urlSlug });
            const subpackageNode: FernNavigation.V1.ApiPackageNode = {
                id: subpackageNodeId,
                type: "apiPackage",
                children: [],
                title: subpackage.displayName ?? titleCase(subpackage.name),
                slug: slug.get(),
                icon: undefined,
                hidden: undefined,
                overviewPageId: undefined,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined,
                noindex: undefined,
                playground: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined
            };

            this.#topLevelSubpackages.set(subpackageId, subpackageNode);
            return subpackageNode;
        }

        // if the unknownIdentifier is not a subpackage, it could be an http endpoint, websocket, or webhook.
        return this.#convertEndpoint(
            {
                type: "endpoint",
                endpoint: unknownIdentifier,
                title: undefined,
                icon: undefined,
                slug: undefined,
                hidden: undefined,
                playground: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined
            },
            apiDefinitionPackageId,
            parentSlug
        );
    }

    #convertEndpoint(
        endpointItem: docsYml.ParsedApiReferenceLayoutItem.Endpoint,
        apiDefinitionPackageIdRaw: string | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageChild | undefined {
        const endpoint = this.#apiDefinitionHolder.getEndpointByLocator(
            endpointItem.endpoint,
            apiDefinitionPackageIdRaw
        );

        if (endpoint != null) {
            if (endpoint.id == null) {
                throw new Error(`Expected Endpoint ID for ${endpoint.id}. Got undefined.`);
            }
            if (this.#visitedEndpoints.has(endpoint.id)) {
                this.taskContext.logger.error(`Duplicate endpoint found in the API Reference layout: ${endpoint.id}`);
            }
            this.#visitedEndpoints.add(endpoint.id);
            const endpointSlug =
                endpointItem.slug != null
                    ? parentSlug.append(endpointItem.slug)
                    : parentSlug.apply({ urlSlug: getApiLatestEndpointToNavigationNodeUrlSlug(endpoint) });
            return {
                id: this.#idgen.get(`${this.apiDefinitionId}:${endpoint.id}`),
                type: "endpoint",
                method: endpoint.method,
                endpointId: endpoint.id,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.V1.convertAvailability(endpoint.availability),
                isResponseStream: endpoint.responses?.[0]?.body.type === "stream",
                title: endpointItem.title ?? endpoint.displayName ?? stringifyEndpointPathParts(endpoint.path),
                slug: endpointSlug.get(),
                icon: endpointItem.icon,
                hidden: endpointItem.hidden,
                playground: this.#convertPlaygroundSettings(endpointItem.playground),
                authed: undefined,
                viewers: endpointItem.viewers,
                orphaned: endpointItem.orphaned,
                featureFlags: endpointItem.featureFlags
            };
        }

        const webSocket = this.#apiDefinitionHolder.getWebSocketByLocator(
            endpointItem.endpoint,
            apiDefinitionPackageIdRaw
        );

        if (webSocket != null) {
            if (webSocket.id == null) {
                throw new Error(`Expected WebSocket ID for ${webSocket.id}. Got undefined.`);
            }
            if (this.#visitedWebSockets.has(webSocket.id)) {
                this.taskContext.logger.error(
                    `Duplicate web socket found in the API Reference layout: ${webSocket.id}`
                );
            }
            this.#visitedWebSockets.add(webSocket.id);
            return {
                id: this.#idgen.get(`${this.apiDefinitionId}:${webSocket.id}`),
                type: "webSocket",
                webSocketId: webSocket.id,
                title: endpointItem.title ?? webSocket.displayName ?? stringifyEndpointPathParts(webSocket.path),
                slug: (endpointItem.slug != null
                    ? parentSlug.append(endpointItem.slug)
                    : parentSlug.apply({ urlSlug: getApiLatestWebSocketToNavigationNodeUrlSlug(webSocket) })
                ).get(),
                icon: endpointItem.icon,
                hidden: endpointItem.hidden,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.V1.convertAvailability(webSocket.availability),
                playground: this.#convertPlaygroundSettings(endpointItem.playground),
                authed: undefined,
                viewers: endpointItem.viewers,
                orphaned: endpointItem.orphaned,
                featureFlags: endpointItem.featureFlags
            };
        }

        const webhook = this.#apiDefinitionHolder.getWebhookByLocator(endpointItem.endpoint, apiDefinitionPackageIdRaw);

        if (webhook != null) {
            if (webhook.id == null) {
                throw new Error(`Expected Webhook ID for ${webhook.id}. Got undefined.`);
            }
            if (this.#visitedWebhooks.has(webhook.id)) {
                this.taskContext.logger.error(`Duplicate webhook found in the API Reference layout: ${webhook.id}`);
            }
            this.#visitedWebhooks.add(webhook.id);
            return {
                id: this.#idgen.get(`${this.apiDefinitionId}:${webhook.id}`),
                type: "webhook",
                webhookId: webhook.id,
                method: webhook.method,
                title: endpointItem.title ?? webhook.displayName ?? urlJoin("/", ...webhook.path),
                slug: (endpointItem.slug != null
                    ? parentSlug.append(endpointItem.slug)
                    : parentSlug.apply({ urlSlug: getApiLatestWebhookToNavigationNodeUrlSlug(webhook) })
                ).get(),
                icon: endpointItem.icon,
                hidden: endpointItem.hidden,
                apiDefinitionId: this.apiDefinitionId,
                availability: undefined,
                authed: undefined,
                viewers: endpointItem.viewers,
                orphaned: endpointItem.orphaned,
                featureFlags: endpointItem.featureFlags
            };
        }

        this.taskContext.logger.error("Unknown identifier in the API Reference layout: ", endpointItem.endpoint);

        return;
    }

    // Step 2

    #mergeAndFilterChildren(
        left: FernNavigation.V1.ApiPackageChild[],
        right: FernNavigation.V1.ApiPackageChild[]
    ): FernNavigation.V1.ApiPackageChild[] {
        return mergeAndFilterChildren({
            left,
            right,
            findEndpointById: (endpointId) => this.#apiDefinitionHolder.getEndpointByLocator(endpointId, undefined),
            stringifyEndpointPathParts: (endpoint: FdrAPI.api.latest.EndpointDefinition) =>
                stringifyEndpointPathParts(endpoint.path),
            disableEndpointPairs: this.disableEndpointPairs,
            apiDefinitionId: this.apiDefinitionId
        });
    }

    #enrichApiPackageChild(child: FernNavigation.V1.ApiPackageChild): FernNavigation.V1.ApiPackageChild {
        return enrichApiPackageChild({
            child,
            nodeIdToSubpackageId: this.#nodeIdToSubpackageId,
            convertApiDefinitionPackageId: (subpackageId, slug) =>
                this.#convertApiDefinitionPackageId(subpackageId, slug),
            mergeAndFilterChildren: this.#mergeAndFilterChildren.bind(this)
        });
    }

    #convertApiDefinitionPackage(
        pkg: FdrAPI.api.latest.ApiDefinition,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageChild[] {
        // if an endpoint, websocket, webhook, or subpackage is not visited, add it to the additional children list
        let additionalChildren: FernNavigation.V1.ApiPackageChild[] = [];

        Object.entries(pkg.subpackages).forEach(([subpackageId, subpackageMetadata]) => {
            if (this.#visitedSubpackages.has(subpackageId)) {
                return;
            }

            const slug = parentSlug.apply({
                urlSlug: kebabCase(subpackageMetadata.name)
            });
            const subpackageNode: FernNavigation.V1.ApiPackageNode = {
                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${subpackageId}`),
                type: "apiPackage",
                children: [],
                title: subpackageMetadata.displayName ?? titleCase(subpackageMetadata.name),
                slug: slug.get(),
                icon: undefined,
                hidden: undefined,
                overviewPageId: undefined,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined,
                noindex: undefined,
                playground: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined
            };

            this.#topLevelSubpackages.set(subpackageId, subpackageNode);
            additionalChildren.push(subpackageNode);
        });

        Object.entries(pkg.endpoints).forEach(([endpointId, endpoint]) => {
            if (endpointId == null) {
                throw new Error(`Expected Endpoint ID for ${endpoint.id}. Got undefined.`);
            }
            if (this.#visitedEndpoints.has(FdrAPI.EndpointId(endpointId))) {
                return;
            }

            const endpointSlug = parentSlug.apply({
                urlSlug: getApiLatestEndpointToNavigationNodeUrlSlug(endpoint)
            });

            const endpointNode: FernNavigation.V1.EndpointNode = {
                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${endpointId}`),
                type: "endpoint",
                method: endpoint.method,
                endpointId: FdrAPI.EndpointId(endpointId),
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.V1.convertAvailability(endpoint.availability),
                isResponseStream: endpoint.responses?.[0]?.body.type === "stream",
                title: endpoint.displayName ?? stringifyEndpointPathParts(endpoint.path),
                slug: endpointSlug.get(),
                icon: undefined,
                hidden: undefined,
                playground: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined
            };

            if (endpoint.namespace != null && endpoint.namespace.length > 0) {
                const firstNamespacePart = endpoint.namespace[0];
                if (firstNamespacePart != null) {
                    let subpackageCursor = this.#topLevelSubpackages.get(firstNamespacePart);
                    if (subpackageCursor == null) {
                        this.taskContext.logger.error(
                            `Subpackage ${firstNamespacePart} not found in ${this.apiDefinitionId}`
                        );
                        return;
                    }
                    let slugGenerator = parentSlug.apply({ urlSlug: kebabCase(subpackageCursor.slug) });

                    for (const namespacePart of endpoint.namespace.slice(1)) {
                        let newSubpackageCursor: FdrAPI.navigation.v1.ApiPackageChild | undefined =
                            subpackageCursor.children.find(
                                (child) => child.type === "apiPackage" && child.id === namespacePart.toString()
                            );
                        slugGenerator = slugGenerator.append(kebabCase(namespacePart));
                        if (newSubpackageCursor == null) {
                            newSubpackageCursor = {
                                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${namespacePart}`),
                                type: "apiPackage",
                                children: [],
                                title: titleCase(namespacePart),
                                slug: slugGenerator.get(),
                                icon: undefined,
                                hidden: undefined,
                                overviewPageId: undefined,
                                availability: undefined,
                                apiDefinitionId: this.apiDefinitionId,
                                pointsTo: undefined,
                                noindex: undefined,
                                playground: undefined,
                                authed: undefined,
                                viewers: undefined,
                                orphaned: undefined,
                                featureFlags: undefined
                            };
                        }
                        if (newSubpackageCursor != null && newSubpackageCursor.type === "apiPackage") {
                            subpackageCursor = newSubpackageCursor;
                        }
                    }

                    subpackageCursor.children.push(endpointNode);
                }
            } else {
                additionalChildren.push(endpointNode);
            }
        });

        Object.entries(pkg.websockets).forEach(([webSocketId, webSocket]) => {
            if (webSocketId == null) {
                throw new Error(`Expected WebSocket ID for ${webSocket.id}. Got undefined.`);
            }
            if (this.#visitedWebSockets.has(FdrAPI.WebSocketId(webSocketId))) {
                return;
            }
            const webSocketNode: FernNavigation.V1.WebSocketNode = {
                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${webSocketId}`),
                type: "webSocket",
                webSocketId: FdrAPI.WebSocketId(webSocketId),
                title: webSocket.displayName ?? stringifyEndpointPathParts(webSocket.path),
                slug: parentSlug
                    .apply({
                        urlSlug: getApiLatestWebSocketToNavigationNodeUrlSlug(webSocket)
                    })
                    .get(),
                icon: undefined,
                hidden: undefined,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.V1.convertAvailability(webSocket.availability),
                playground: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined
            };
            if (webSocket.namespace != null && webSocket.namespace.length > 0) {
                const firstNamespacePart = webSocket.namespace[0];
                if (firstNamespacePart != null) {
                    let subpackageCursor = this.#topLevelSubpackages.get(firstNamespacePart);
                    if (subpackageCursor == null) {
                        throw new Error(`Subpackage ${firstNamespacePart} not found in ${this.apiDefinitionId}`);
                    }
                    let slugGenerator = parentSlug.apply({ urlSlug: subpackageCursor.slug });

                    for (const namespacePart of webSocket.namespace.slice(1)) {
                        let newSubpackageCursor: FdrAPI.navigation.v1.ApiPackageChild | undefined =
                            subpackageCursor.children.find(
                                (child) => child.type === "apiPackage" && child.id === namespacePart.toString()
                            );
                        slugGenerator = slugGenerator.append(namespacePart);
                        if (newSubpackageCursor == null) {
                            newSubpackageCursor = {
                                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${namespacePart}`),
                                type: "apiPackage",
                                children: [],
                                title: titleCase(namespacePart),
                                slug: slugGenerator.get(),
                                icon: undefined,
                                hidden: undefined,
                                overviewPageId: undefined,
                                availability: undefined,
                                apiDefinitionId: this.apiDefinitionId,
                                pointsTo: undefined,
                                noindex: undefined,
                                playground: undefined,
                                authed: undefined,
                                viewers: undefined,
                                orphaned: undefined,
                                featureFlags: undefined
                            };
                        }
                        if (newSubpackageCursor != null && newSubpackageCursor.type === "apiPackage") {
                            subpackageCursor = newSubpackageCursor;
                        }
                    }
                    subpackageCursor.children.push(webSocketNode);
                }
            } else {
                additionalChildren.push(webSocketNode);
            }
        });

        Object.entries(pkg.webhooks).forEach(([webhookId, webhook]) => {
            if (webhookId == null) {
                throw new Error(`Expected Webhook ID for ${webhook.id}. Got undefined.`);
            }
            if (this.#visitedWebhooks.has(FdrAPI.WebhookId(webhookId))) {
                return;
            }
            const webhookNode: FernNavigation.V1.WebhookNode = {
                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${webhookId}`),
                type: "webhook",
                webhookId: FdrAPI.WebhookId(webhookId),
                method: webhook.method,
                title: webhook.displayName ?? titleCase(webhook.id),
                slug: parentSlug
                    .apply({
                        urlSlug: getApiLatestWebhookToNavigationNodeUrlSlug(webhook)
                    })
                    .get(),
                icon: undefined,
                hidden: undefined,
                apiDefinitionId: this.apiDefinitionId,
                availability: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined
            };

            if (webhook.namespace != null && webhook.namespace.length > 0) {
                const firstNamespacePart = webhook.namespace[0];
                if (firstNamespacePart != null) {
                    let subpackageCursor = this.#topLevelSubpackages.get(firstNamespacePart);
                    if (subpackageCursor == null) {
                        throw new Error(
                            `Subpackage subpackage_${firstNamespacePart} not found in ${this.apiDefinitionId}`
                        );
                    }
                    let slugGenerator = parentSlug.apply({ urlSlug: subpackageCursor.slug });

                    for (const namespacePart of webhook.namespace.slice(1)) {
                        let newSubpackageCursor: FdrAPI.navigation.v1.ApiPackageChild | undefined =
                            subpackageCursor.children.find(
                                (child) => child.type === "apiPackage" && child.id === namespacePart.toString()
                            );
                        slugGenerator = slugGenerator.append(namespacePart);
                        if (newSubpackageCursor == null) {
                            newSubpackageCursor = {
                                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${namespacePart}`),
                                type: "apiPackage",
                                children: [],
                                title: namespacePart,
                                slug: slugGenerator.get(),
                                icon: undefined,
                                hidden: undefined,
                                overviewPageId: undefined,
                                availability: undefined,
                                apiDefinitionId: this.apiDefinitionId,
                                pointsTo: undefined,
                                noindex: undefined,
                                playground: undefined,
                                authed: undefined,
                                viewers: undefined,
                                orphaned: undefined,
                                featureFlags: undefined
                            };
                        }
                        if (newSubpackageCursor != null && newSubpackageCursor.type === "apiPackage") {
                            subpackageCursor = newSubpackageCursor;
                        }
                    }
                    subpackageCursor.children.push(webhookNode);
                }
            } else {
                additionalChildren.push(webhookNode);
            }
        });

        additionalChildren = this.mergeEndpointPairs(additionalChildren);

        if (this.apiSection.alphabetized) {
            additionalChildren = additionalChildren.sort((a, b) => {
                const aTitle = a.type === "endpointPair" ? a.nonStream.title : a.title;
                const bTitle = b.type === "endpointPair" ? b.nonStream.title : b.title;
                return aTitle.localeCompare(bTitle);
            });
        }

        return additionalChildren;
    }

    // TODO: optimize this with some DP, where we store incrementally found endpoints (constructing an indexed tree of subpackages)
    #resolveSubpackage(subpackageId: string): FdrAPI.api.latest.ApiDefinition {
        const endpoints = Object.fromEntries(
            Object.entries(this.#api?.endpoints ?? {}).filter(
                ([_, endpoint]) =>
                    endpoint.namespace != null &&
                    endpoint.namespace[endpoint.namespace.length - 1] === FdrAPI.api.v1.SubpackageId(subpackageId)
            )
        );
        const websockets = Object.fromEntries(
            Object.entries(this.#api?.websockets ?? {}).filter(
                ([_, webSocket]) =>
                    webSocket.namespace != null &&
                    webSocket.namespace[webSocket.namespace.length - 1] === FdrAPI.api.v1.SubpackageId(subpackageId)
            )
        );
        const webhooks = Object.fromEntries(
            Object.entries(this.#api?.webhooks ?? {}).filter(
                ([_, webhook]) =>
                    webhook.namespace != null &&
                    webhook.namespace[webhook.namespace.length - 1] === FdrAPI.api.v1.SubpackageId(subpackageId)
            )
        );
        return {
            id: FdrAPI.ApiDefinitionId(subpackageId),
            endpoints,
            websockets,
            webhooks,
            types: {},
            subpackages: {},
            auths: {},
            globalHeaders: undefined,
            snippetsConfiguration: undefined
        };
    }

    #convertApiDefinitionPackageId(
        packageId: string | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageChild[] {
        const pkg = packageId != null ? this.#resolveSubpackage(packageId) : undefined;

        if (pkg == null) {
            this.taskContext.logger.error(`Subpackage ${packageId} not found in ${this.apiDefinitionId}`);
            return [];
        }

        // if an endpoint, websocket, webhook, or subpackage is not visited, add it to the additional children list
        return this.#convertApiDefinitionPackage(pkg, parentSlug);
    }

    #convertPlaygroundSettings(
        playgroundSettings?: docsYml.RawSchemas.PlaygroundSettings
    ): FernNavigation.V1.PlaygroundSettings | undefined {
        return convertPlaygroundSettings(playgroundSettings);
    }

    private mergeEndpointPairs(children: FernNavigation.V1.ApiPackageChild[]): FernNavigation.V1.ApiPackageChild[] {
        return mergeEndpointPairs({
            children,
            findEndpointById: (endpointId: FdrAPI.EndpointId) => this.#api?.endpoints[endpointId],
            stringifyEndpointPathParts: (endpoint: FdrAPI.api.latest.EndpointDefinition) =>
                stringifyEndpointPathParts(endpoint.path),
            disableEndpointPairs: this.disableEndpointPairs,
            apiDefinitionId: this.apiDefinitionId
        });
    }
}
