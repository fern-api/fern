import { kebabCase } from "lodash-es";
import urlJoin from "url-join";

import { docsYml } from "@fern-api/configuration-loader";
import { isNonNullish } from "@fern-api/core-utils";
import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath, relative } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { titleCase, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

import { ApiDefinitionHolder } from "./ApiDefinitionHolder";
import { ChangelogNodeConverter } from "./ChangelogNodeConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { isSubpackage } from "./utils/isSubpackage";
import { stringifyEndpointPathParts } from "./utils/stringifyEndpointPathParts";

export class ApiReferenceNodeConverter {
    apiDefinitionId: FernNavigation.V1.ApiDefinitionId;
    #holder: ApiDefinitionHolder;
    #visitedEndpoints = new Set<FernNavigation.V1.EndpointId>();
    #visitedWebSockets = new Set<FernNavigation.V1.WebSocketId>();
    #visitedWebhooks = new Set<FernNavigation.V1.WebhookId>();
    #visitedSubpackages = new Set<string>();
    #nodeIdToSubpackageId = new Map<string, string[]>();
    #children: FernNavigation.V1.ApiPackageChild[] = [];
    #overviewPageId: FernNavigation.V1.PageId | undefined;
    #slug: FernNavigation.V1.SlugGenerator;
    #idgen: NodeIdGenerator;
    private disableEndpointPairs;
    constructor(
        private apiSection: docsYml.DocsNavigationItem.ApiSection,
        api: APIV1Read.ApiDefinition,
        parentSlug: FernNavigation.V1.SlugGenerator,
        private workspace: FernWorkspace,
        private docsWorkspace: DocsWorkspace,
        private taskContext: TaskContext,
        private markdownFilesToFullSlugs: Map<AbsoluteFilePath, string>,
        idgen: NodeIdGenerator
    ) {
        this.disableEndpointPairs = docsWorkspace.config.experimental?.disableStreamToggle ?? false;
        this.apiDefinitionId = FernNavigation.V1.ApiDefinitionId(api.id);
        this.#holder = ApiDefinitionHolder.create(api, taskContext);

        // we are assuming that the apiDefinitionId is unique.
        this.#idgen = idgen;

        this.#overviewPageId =
            this.apiSection.overviewAbsolutePath != null
                ? FernNavigation.V1.PageId(this.toRelativeFilepath(this.apiSection.overviewAbsolutePath))
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
            this.#children = this.#convertApiReferenceLayoutItems(
                this.apiSection.navigation,
                this.#holder.api.rootPackage,
                this.#slug
            );
        }

        // Step 2. Fill in the any missing navigation items from the API definition
        this.#children = this.#mergeAndFilterChildren(
            this.#children.map((child) => this.#enrichApiPackageChild(child)),
            this.#convertApiDefinitionPackage(this.#holder.api.rootPackage, this.#slug)
        );
    }

    public get(): FernNavigation.V1.ApiReferenceNode {
        const pointsTo = FernNavigation.V1.followRedirects(this.#children);
        const changelogNodeConverter = new ChangelogNodeConverter(
            this.markdownFilesToFullSlugs,
            this.workspace.changelog?.files.map((file) => file.absoluteFilepath),
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
            orphaned: this.apiSection.orphaned
        };
    }

    // Step 1

    #convertApiReferenceLayoutItems(
        navigation: docsYml.ParsedApiReferenceLayoutItem[],
        apiDefinitionPackage: APIV1Read.ApiDefinitionPackage | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageChild[] {
        apiDefinitionPackage = this.#holder.resolveSubpackage(apiDefinitionPackage);
        const apiDefinitionPackageId =
            apiDefinitionPackage != null ? ApiDefinitionHolder.getSubpackageId(apiDefinitionPackage) : undefined;
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
        const pageId = FernNavigation.V1.PageId(this.toRelativeFilepath(page.absolutePath));
        const pageSlug = parentSlug.apply({
            fullSlug: this.markdownFilesToFullSlugs.get(page.absolutePath)?.split("/"),
            urlSlug: page.slug ?? kebabCase(page.title)
        });
        return {
            id: this.#idgen.get(pageId),
            type: "page",
            pageId,
            title: page.title,
            slug: pageSlug.get(),
            icon: page.icon,
            hidden: page.hidden,
            noindex: page.noindex,
            authed: undefined,
            viewers: page.viewers,
            orphaned: page.orphaned
        };
    }

    #convertPackage(
        pkg: docsYml.ParsedApiReferenceLayoutItem.Package,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageNode {
        const overviewPageId =
            pkg.overviewAbsolutePath != null
                ? FernNavigation.V1.PageId(this.toRelativeFilepath(pkg.overviewAbsolutePath))
                : undefined;

        const maybeFullSlug =
            pkg.overviewAbsolutePath != null ? this.markdownFilesToFullSlugs.get(pkg.overviewAbsolutePath) : undefined;

        const subpackage = this.#holder.getSubpackageByIdOrLocator(pkg.package);

        if (subpackage != null) {
            const subpackageId = ApiDefinitionHolder.getSubpackageId(subpackage);
            const subpackageNodeId = this.#idgen.get(overviewPageId ?? `${this.apiDefinitionId}:${subpackageId}`);

            if (this.#visitedSubpackages.has(subpackageId)) {
                this.taskContext.logger.error(
                    `Duplicate subpackage found in the API Reference layout: ${subpackageId}`
                );
            }

            this.#visitedSubpackages.add(subpackageId);
            this.#nodeIdToSubpackageId.set(subpackageNodeId, [subpackageId]);
            const urlSlug =
                pkg.slug ??
                (isSubpackage(subpackage)
                    ? subpackage.urlSlug
                    : (this.apiSection.slug ?? kebabCase(this.apiSection.title)));
            const slug = parentSlug.apply({
                fullSlug: maybeFullSlug?.split("/"),
                skipUrlSlug: pkg.skipUrlSlug,
                urlSlug
            });
            const convertedItems = this.#convertApiReferenceLayoutItems(pkg.contents, subpackage, slug);
            return {
                id: subpackageNodeId,
                type: "apiPackage",
                children: convertedItems,
                title:
                    pkg.title ??
                    (isSubpackage(subpackage)
                        ? (subpackage.displayName ?? titleCase(subpackage.name))
                        : this.apiSection.title),
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
                orphaned: pkg.orphaned
            };
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
            const convertedItems = this.#convertApiReferenceLayoutItems(pkg.contents, undefined, slug);
            return {
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
                orphaned: pkg.orphaned
            };
        }
    }

    #convertSection(
        section: docsYml.ParsedApiReferenceLayoutItem.Section,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageNode {
        const overviewPageId =
            section.overviewAbsolutePath != null
                ? FernNavigation.V1.PageId(this.toRelativeFilepath(section.overviewAbsolutePath))
                : undefined;

        const maybeFullSlug =
            section.overviewAbsolutePath != null
                ? this.markdownFilesToFullSlugs.get(section.overviewAbsolutePath)
                : undefined;

        const nodeId = this.#idgen.get(overviewPageId ?? maybeFullSlug ?? parentSlug.get());

        const subpackageIds = section.referencedSubpackages
            .map((locator) => {
                const subpackage = this.#holder.getSubpackageByIdOrLocator(locator);
                return subpackage != null ? ApiDefinitionHolder.getSubpackageId(subpackage) : undefined;
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
        const convertedItems = this.#convertApiReferenceLayoutItems(section.contents, undefined, slug);
        return {
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
            orphaned: section.orphaned
        };
    }

    #convertUnknownIdentifier(
        unknownIdentifier: string,
        apiDefinitionPackageId: string | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageChild | undefined {
        unknownIdentifier = unknownIdentifier.trim();
        // unknownIdentifier could either be a package, endpoint, websocket, or webhook.
        // We need to determine which one it is.
        const subpackage = this.#holder.getSubpackageByIdOrLocator(unknownIdentifier);
        if (subpackage != null) {
            const subpackageId = ApiDefinitionHolder.getSubpackageId(subpackage);
            const subpackageNodeId = this.#idgen.get(`${this.apiDefinitionId}:${subpackageId}`);

            if (this.#visitedSubpackages.has(subpackageId)) {
                this.taskContext.logger.error(
                    `Duplicate subpackage found in the API Reference layout: ${subpackageId}`
                );
            }

            this.#visitedSubpackages.add(subpackageId);
            this.#nodeIdToSubpackageId.set(subpackageNodeId, [subpackageId]);
            const urlSlug = isSubpackage(subpackage) ? subpackage.urlSlug : "";
            const slug = parentSlug.apply({ urlSlug });
            return {
                id: subpackageNodeId,
                type: "apiPackage",
                children: [],
                title: isSubpackage(subpackage)
                    ? (subpackage.displayName ?? titleCase(subpackage.name))
                    : this.apiSection.title,
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
                orphaned: undefined
            };
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
                orphaned: undefined
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
        const endpoint =
            (apiDefinitionPackageIdRaw != null
                ? this.#holder.subpackages
                      .get(APIV1Read.SubpackageId(apiDefinitionPackageIdRaw))
                      ?.endpoints.get(APIV1Read.EndpointId(endpointItem.endpoint))
                : undefined) ?? this.#holder.endpointsByLocator.get(endpointItem.endpoint);
        if (endpoint != null) {
            const endpointId = this.#holder.getEndpointId(endpoint);
            if (endpointId == null) {
                throw new Error(`Expected Endpoint ID for ${endpoint.id}. Got undefined.`);
            }
            if (this.#visitedEndpoints.has(endpointId)) {
                this.taskContext.logger.error(`Duplicate endpoint found in the API Reference layout: ${endpointId}`);
            }
            this.#visitedEndpoints.add(endpointId);
            const endpointSlug =
                endpointItem.slug != null ? parentSlug.append(endpointItem.slug) : parentSlug.apply(endpoint);
            return {
                id: this.#idgen.get(`${this.apiDefinitionId}:${endpointId}`),
                type: "endpoint",
                method: endpoint.method,
                endpointId,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.V1.convertAvailability(endpoint.availability),
                isResponseStream: endpoint.response?.type.type === "stream",
                title: endpointItem.title ?? endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
                slug: endpointSlug.get(),
                icon: endpointItem.icon,
                hidden: endpointItem.hidden,
                playground: this.#convertPlaygroundSettings(endpointItem.playground),
                authed: undefined,
                viewers: endpointItem.viewers,
                orphaned: endpointItem.orphaned
            };
        }

        const webSocket =
            (apiDefinitionPackageIdRaw != null
                ? this.#holder.subpackages
                      .get(APIV1Read.SubpackageId(apiDefinitionPackageIdRaw))
                      ?.webSockets.get(APIV1Read.WebSocketId(endpointItem.endpoint))
                : undefined) ?? this.#holder.webSocketsByLocator.get(endpointItem.endpoint);

        if (webSocket != null) {
            const webSocketId = this.#holder.getWebSocketId(webSocket);
            if (webSocketId == null) {
                throw new Error(`Expected WebSocket ID for ${webSocket.id}. Got undefined.`);
            }
            if (this.#visitedWebSockets.has(webSocketId)) {
                this.taskContext.logger.error(`Duplicate web socket found in the API Reference layout: ${webSocketId}`);
            }
            this.#visitedWebSockets.add(webSocketId);
            return {
                id: this.#idgen.get(`${this.apiDefinitionId}:${webSocketId}`),
                type: "webSocket",
                webSocketId,
                title: endpointItem.title ?? webSocket.name ?? stringifyEndpointPathParts(webSocket.path.parts),
                slug: (endpointItem.slug != null
                    ? parentSlug.append(endpointItem.slug)
                    : parentSlug.apply(webSocket)
                ).get(),
                icon: endpointItem.icon,
                hidden: endpointItem.hidden,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.V1.convertAvailability(webSocket.availability),
                playground: this.#convertPlaygroundSettings(endpointItem.playground),
                authed: undefined,
                viewers: endpointItem.viewers,
                orphaned: endpointItem.orphaned
            };
        }

        const webhook =
            (apiDefinitionPackageIdRaw != null
                ? this.#holder.subpackages
                      .get(APIV1Read.SubpackageId(apiDefinitionPackageIdRaw))
                      ?.webhooks.get(APIV1Read.WebhookId(endpointItem.endpoint))
                : undefined) ?? this.#holder.webhooks.get(FernNavigation.V1.WebhookId(endpointItem.endpoint));

        if (webhook != null) {
            const webhookId = this.#holder.getWebhookId(webhook);
            if (webhookId == null) {
                throw new Error(`Expected Webhook ID for ${webhook.id}. Got undefined.`);
            }
            if (this.#visitedWebhooks.has(webhookId)) {
                this.taskContext.logger.error(`Duplicate webhook found in the API Reference layout: ${webhookId}`);
            }
            this.#visitedWebhooks.add(webhookId);
            return {
                id: this.#idgen.get(`${this.apiDefinitionId}:${webhookId}`),
                type: "webhook",
                webhookId,
                method: webhook.method,
                title: endpointItem.title ?? webhook.name ?? urlJoin("/", ...webhook.path),
                slug: (endpointItem.slug != null
                    ? parentSlug.append(endpointItem.slug)
                    : parentSlug.apply(webhook)
                ).get(),
                icon: endpointItem.icon,
                hidden: endpointItem.hidden,
                apiDefinitionId: this.apiDefinitionId,
                availability: undefined,
                authed: undefined,
                viewers: endpointItem.viewers,
                orphaned: endpointItem.orphaned
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
        return this.mergeEndpointPairs([...left, ...right]).filter((child) =>
            child.type === "apiPackage" ? child.children.length > 0 : true
        );
    }

    #enrichApiPackageChild(child: FernNavigation.V1.ApiPackageChild): FernNavigation.V1.ApiPackageChild {
        if (child.type === "apiPackage") {
            // expand the subpackage to include children that haven't been visited yet
            const slug = FernNavigation.V1.SlugGenerator.init(child.slug);
            const subpackageIds = this.#nodeIdToSubpackageId.get(child.id) ?? [];
            const subpackageChildren = subpackageIds.flatMap((subpackageId) =>
                this.#convertApiDefinitionPackageId(subpackageId, slug)
            );

            // recursively apply enrichment to children
            const enrichedChildren = child.children.map((innerChild) => this.#enrichApiPackageChild(innerChild));

            // combine children with subpackage (tacked on at the end to preserve order)
            const children = this.#mergeAndFilterChildren(enrichedChildren, subpackageChildren);

            return {
                ...child,
                children,
                pointsTo: undefined
            };
        }
        return child;
    }

    #convertApiDefinitionPackage(
        pkg: APIV1Read.ApiDefinitionPackage,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageChild[] {
        // if an endpoint, websocket, webhook, or subpackage is not visited, add it to the additional children list
        let additionalChildren: FernNavigation.V1.ApiPackageChild[] = [];

        pkg.endpoints.forEach((endpoint) => {
            const endpointId = this.#holder.getEndpointId(endpoint);
            if (endpointId == null) {
                throw new Error(`Expected Endpoint ID for ${endpoint.id}. Got undefined.`);
            }
            if (this.#visitedEndpoints.has(endpointId)) {
                return;
            }

            const endpointSlug = parentSlug.apply(endpoint);
            additionalChildren.push({
                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${endpointId}`),
                type: "endpoint",
                method: endpoint.method,
                endpointId,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.V1.convertAvailability(endpoint.availability),
                isResponseStream: endpoint.response?.type.type === "stream",
                title: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
                slug: endpointSlug.get(),
                icon: undefined,
                hidden: undefined,
                playground: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined
            });
        });

        pkg.websockets.forEach((webSocket) => {
            const webSocketId = this.#holder.getWebSocketId(webSocket);
            if (webSocketId == null) {
                throw new Error(`Expected WebSocket ID for ${webSocket.id}. Got undefined.`);
            }
            if (this.#visitedWebSockets.has(webSocketId)) {
                return;
            }
            additionalChildren.push({
                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${webSocketId}`),
                type: "webSocket",
                webSocketId,
                title: webSocket.name ?? stringifyEndpointPathParts(webSocket.path.parts),
                slug: parentSlug.apply(webSocket).get(),
                icon: undefined,
                hidden: undefined,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.V1.convertAvailability(webSocket.availability),
                playground: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined
            });
        });

        pkg.webhooks.forEach((webhook) => {
            const webhookId = this.#holder.getWebhookId(webhook);
            if (webhookId == null) {
                throw new Error(`Expected Webhook ID for ${webhook.id}. Got undefined.`);
            }
            if (this.#visitedWebhooks.has(webhookId)) {
                return;
            }
            additionalChildren.push({
                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${webhookId}`),
                type: "webhook",
                webhookId,
                method: webhook.method,
                title: webhook.name ?? titleCase(webhook.id),
                slug: parentSlug.apply(webhook).get(),
                icon: undefined,
                hidden: undefined,
                apiDefinitionId: this.apiDefinitionId,
                availability: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined
            });
        });

        pkg.subpackages.forEach((subpackageId) => {
            if (this.#visitedSubpackages.has(subpackageId)) {
                return;
            }

            const subpackage = this.#holder.getSubpackageByIdOrLocator(subpackageId);
            if (subpackage == null) {
                this.taskContext.logger.error(`Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`);
                return;
            }

            const slug = isSubpackage(subpackage) ? parentSlug.apply(subpackage) : parentSlug;
            const subpackageChildren = this.#convertApiDefinitionPackageId(subpackageId, slug);
            if (subpackageChildren.length > 0) {
                additionalChildren.push({
                    id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${subpackageId}`),
                    type: "apiPackage",
                    children: subpackageChildren,
                    title: isSubpackage(subpackage)
                        ? (subpackage.displayName ?? titleCase(subpackage.name))
                        : this.apiSection.title,
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
                    orphaned: undefined
                });
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

    #convertApiDefinitionPackageId(
        packageId: string | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator
    ): FernNavigation.V1.ApiPackageChild[] {
        const pkg =
            packageId != null
                ? this.#holder.resolveSubpackage(this.#holder.getSubpackageByIdOrLocator(packageId))
                : undefined;

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
        if (playgroundSettings) {
            return {
                environments:
                    playgroundSettings.environments != null && playgroundSettings.environments.length > 0
                        ? playgroundSettings.environments.map((environmentId) =>
                              FernNavigation.V1.EnvironmentId(environmentId)
                          )
                        : undefined,
                button:
                    playgroundSettings.button != null && playgroundSettings.button.href
                        ? { href: FernNavigation.V1.Url(playgroundSettings.button.href) }
                        : undefined,
                "limit-websocket-messages-per-connection":
                    playgroundSettings.limitWebsocketMessagesPerConnection != null
                        ? playgroundSettings.limitWebsocketMessagesPerConnection
                        : undefined
            };
        }

        return;
    }

    private mergeEndpointPairs(children: FernNavigation.V1.ApiPackageChild[]): FernNavigation.V1.ApiPackageChild[] {
        if (this.disableEndpointPairs) {
            return children;
        }

        const toRet: FernNavigation.V1.ApiPackageChild[] = [];

        const methodAndPathToEndpointNode = new Map<string, FernNavigation.V1.EndpointNode>();
        children.forEach((child) => {
            if (child.type !== "endpoint") {
                toRet.push(child);
                return;
            }

            const endpoint = this.#holder.endpoints.get(child.endpointId);
            if (endpoint == null) {
                throw new Error(`Endpoint ${child.endpointId} not found`);
            }

            const methodAndPath = `${endpoint.method} ${stringifyEndpointPathParts(endpoint.path.parts)}`;

            const existing = methodAndPathToEndpointNode.get(methodAndPath);
            methodAndPathToEndpointNode.set(methodAndPath, child);

            if (existing == null || existing.isResponseStream === child.isResponseStream) {
                toRet.push(child);
                return;
            }

            const idx = toRet.indexOf(existing);
            const stream = child.isResponseStream ? child : existing;
            const nonStream = child.isResponseStream ? existing : child;
            const pairNode: FernNavigation.V1.EndpointPairNode = {
                id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${nonStream.endpointId}+${stream.endpointId}`),
                type: "endpointPair",
                stream,
                nonStream
            };

            toRet[idx] = pairNode;
        });

        return toRet;
    }

    private toRelativeFilepath(filepath: AbsoluteFilePath): RelativeFilePath;
    private toRelativeFilepath(filepath: AbsoluteFilePath | undefined): RelativeFilePath | undefined;
    private toRelativeFilepath(filepath: AbsoluteFilePath | undefined): RelativeFilePath | undefined {
        if (filepath == null) {
            return undefined;
        }
        return relative(this.docsWorkspace.absoluteFilePath, filepath);
    }
}
