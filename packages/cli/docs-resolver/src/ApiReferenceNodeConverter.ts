import { docsYml } from "@fern-api/configuration";
import { isNonNullish } from "@fern-api/core-utils";
import { APIV1Read, FernNavigation, titleCase, visitDiscriminatedUnion } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { kebabCase } from "lodash-es";
import urlJoin from "url-join";
import { ApiDefinitionHolder } from "./ApiDefinitionHolder";
import { ChangelogNodeConverter } from "./ChangelogNodeConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { isSubpackage } from "./utils/isSubpackage";
import { stringifyEndpointPathParts } from "./utils/stringifyEndpointPathParts";

export class ApiReferenceNodeConverter {
    apiDefinitionId: FernNavigation.ApiDefinitionId;
    #holder: ApiDefinitionHolder;
    #visitedEndpoints = new Set<FernNavigation.EndpointId>();
    #visitedWebSockets = new Set<FernNavigation.WebSocketId>();
    #visitedWebhooks = new Set<FernNavigation.WebhookId>();
    #visitedSubpackages = new Set<string>();
    #nodeIdToSubpackageId = new Map<string, string[]>();
    #children: FernNavigation.ApiPackageChild[] = [];
    #overviewPageId: FernNavigation.PageId | undefined;
    #slug: FernNavigation.SlugGenerator;
    private disableEndpointPairs;
    constructor(
        private apiSection: docsYml.DocsNavigationItem.ApiSection,
        api: APIV1Read.ApiDefinition,
        parentSlug: FernNavigation.SlugGenerator,
        private workspace: FernWorkspace,
        private docsWorkspace: DocsWorkspace,
        private taskContext: TaskContext,
        private markdownFilesToFullSlugs: Map<AbsoluteFilePath, string>
    ) {
        this.disableEndpointPairs = docsWorkspace.config.experimental?.disableStreamToggle ?? false;
        this.apiDefinitionId = FernNavigation.ApiDefinitionId(api.id);
        this.#holder = ApiDefinitionHolder.create(api, taskContext);

        // we are assuming that the apiDefinitionId is unique.
        const idgen = NodeIdGenerator.init(this.apiDefinitionId);

        this.#overviewPageId =
            this.apiSection.overviewAbsolutePath != null
                ? FernNavigation.PageId(this.toRelativeFilepath(this.apiSection.overviewAbsolutePath))
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
                this.#slug,
                idgen
            );
        }

        // Step 2. Fill in the any missing navigation items from the API definition
        this.#children = this.#mergeAndFilterChildren(
            this.#children.map((child) => this.#enrichApiPackageChild(child)),
            this.#convertApiDefinitionPackage(this.#holder.api.rootPackage, this.#slug)
        );
    }

    public get(): FernNavigation.ApiReferenceNode {
        const pointsTo = FernNavigation.utils.followRedirects(this.#children);
        const idgen = NodeIdGenerator.init(this.apiDefinitionId);
        return {
            id: idgen.get(),
            type: "apiReference",
            title: this.apiSection.title,
            apiDefinitionId: this.apiDefinitionId,
            overviewPageId: this.#overviewPageId,
            disableLongScrolling: this.apiSection.paginated,
            slug: this.#slug.get(),
            icon: this.apiSection.icon,
            hidden: this.apiSection.hidden,
            hideTitle: this.apiSection.flattened,
            showErrors: this.apiSection.showErrors,
            changelog: new ChangelogNodeConverter(
                this.markdownFilesToFullSlugs,
                this.workspace.changelog?.files.map((file) => file.absoluteFilepath),
                this.docsWorkspace,
                idgen
            ).convert({
                parentSlug: this.#slug
            }),
            children: this.#children,
            availability: undefined,
            pointsTo,
            noindex: undefined
        };
    }

    // Step 1

    #convertApiReferenceLayoutItems(
        navigation: docsYml.ParsedApiReferenceLayoutItem[],
        apiDefinitionPackage: APIV1Read.ApiDefinitionPackage | undefined,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageChild[] {
        apiDefinitionPackage = this.#holder.resolveSubpackage(apiDefinitionPackage);
        const apiDefinitionPackageId =
            apiDefinitionPackage != null ? ApiDefinitionHolder.getSubpackageId(apiDefinitionPackage) : undefined;
        return navigation
            .map((item) =>
                visitDiscriminatedUnion(item)._visit<FernNavigation.ApiPackageChild | undefined>({
                    link: (link) => ({
                        id: idgen.append(`link:${link.url}`).get(),
                        type: "link",
                        title: link.text,
                        icon: link.icon,
                        url: FernNavigation.Url(link.url)
                    }),
                    page: (page) => {
                        const pageId = FernNavigation.PageId(this.toRelativeFilepath(page.absolutePath));
                        const pageSlug = parentSlug.apply({
                            fullSlug: this.markdownFilesToFullSlugs.get(page.absolutePath)?.split("/"),
                            urlSlug: page.slug ?? kebabCase(page.title)
                        });
                        return {
                            id: idgen.append(`page:${pageId}`).get(),
                            type: "page",
                            pageId,
                            title: page.title,
                            slug: pageSlug.get(),
                            icon: page.icon,
                            hidden: page.hidden,
                            noindex: page.noindex
                        };
                    },
                    package: (pkg) => this.#convertPackage(pkg, parentSlug, idgen),
                    section: (section) => this.#convertSection(section, parentSlug, idgen),
                    item: ({ value: unknownIdentifier }): FernNavigation.ApiPackageChild | undefined =>
                        this.#convertUnknownIdentifier(unknownIdentifier, apiDefinitionPackageId, parentSlug, idgen),
                    endpoint: (endpoint) => this.#convertEndpoint(endpoint, apiDefinitionPackageId, parentSlug, idgen)
                })
            )
            .filter(isNonNullish);
    }

    #convertPackage(
        pkg: docsYml.ParsedApiReferenceLayoutItem.Package,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageNode {
        const overviewPageId =
            pkg.overviewAbsolutePath != null
                ? FernNavigation.PageId(this.toRelativeFilepath(pkg.overviewAbsolutePath))
                : undefined;

        const maybeFullSlug =
            pkg.overviewAbsolutePath != null ? this.markdownFilesToFullSlugs.get(pkg.overviewAbsolutePath) : undefined;

        const subpackage = this.#holder.getSubpackage(pkg.package);

        if (subpackage != null) {
            const subpackageId = ApiDefinitionHolder.getSubpackageId(subpackage);
            const subpackageNodeId = idgen.append(subpackageId);

            if (this.#visitedSubpackages.has(subpackageId)) {
                this.taskContext.logger.error(
                    `Duplicate subpackage found in the API Reference layout: ${subpackageId}`
                );
            }

            this.#visitedSubpackages.add(subpackageId);
            this.#nodeIdToSubpackageId.set(subpackageNodeId.get(), [subpackageId]);
            const urlSlug =
                pkg.slug ??
                (isSubpackage(subpackage)
                    ? subpackage.urlSlug
                    : this.apiSection.slug ?? kebabCase(this.apiSection.title));
            const slug = parentSlug.apply({
                fullSlug: maybeFullSlug?.split("/"),
                skipUrlSlug: pkg.skipUrlSlug,
                urlSlug
            });
            const convertedItems = this.#convertApiReferenceLayoutItems(
                pkg.contents,
                subpackage,
                slug,
                subpackageNodeId
            );
            return {
                id: subpackageNodeId.get(),
                type: "apiPackage",
                children: convertedItems,
                title:
                    pkg.title ??
                    (isSubpackage(subpackage)
                        ? subpackage.displayName ?? titleCase(subpackage.name)
                        : this.apiSection.title),
                slug: slug.get(),
                icon: pkg.icon,
                hidden: pkg.hidden,
                overviewPageId,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined,
                noindex: undefined
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
            const convertedItems = this.#convertApiReferenceLayoutItems(pkg.contents, undefined, slug, idgen);
            return {
                id: idgen.append(kebabCase(pkg.package)).get(),
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
                noindex: undefined
            };
        }
    }

    #convertSection(
        section: docsYml.ParsedApiReferenceLayoutItem.Section,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageNode {
        const overviewPageId =
            section.overviewAbsolutePath != null
                ? FernNavigation.PageId(this.toRelativeFilepath(section.overviewAbsolutePath))
                : undefined;

        const maybeFullSlug =
            section.overviewAbsolutePath != null
                ? this.markdownFilesToFullSlugs.get(section.overviewAbsolutePath)
                : undefined;

        const nodeId = idgen.append(`section:${kebabCase(section.title)}`);

        const subpackages = section.referencedSubpackages.filter((subpackageId) => {
            const subpackage = this.#holder.getSubpackage(subpackageId);
            if (subpackage == null) {
                this.taskContext.logger.error(`Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`);
                return false;
            }
            return true;
        });

        this.#nodeIdToSubpackageId.set(nodeId.get(), subpackages);
        subpackages.forEach((subpackageId) => {
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
        const convertedItems = this.#convertApiReferenceLayoutItems(section.contents, undefined, slug, idgen);
        return {
            id: nodeId.get(),
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
            noindex: undefined
        };
    }

    #convertUnknownIdentifier(
        unknownIdentifier: string,
        apiDefinitionPackageId: string | undefined,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageChild | undefined {
        unknownIdentifier = unknownIdentifier.trim();
        // unknownIdentifier could either be a package, endpoint, websocket, or webhook.
        // We need to determine which one it is.
        const subpackage = this.#holder.getSubpackage(unknownIdentifier);
        if (subpackage != null) {
            const subpackageId = ApiDefinitionHolder.getSubpackageId(subpackage);
            const subpackageNodeId = idgen.append(subpackageId);

            if (this.#visitedSubpackages.has(subpackageId)) {
                this.taskContext.logger.error(
                    `Duplicate subpackage found in the API Reference layout: ${subpackageId}`
                );
            }

            this.#visitedSubpackages.add(subpackageId);
            this.#nodeIdToSubpackageId.set(subpackageNodeId.get(), [subpackageId]);
            const urlSlug = isSubpackage(subpackage) ? subpackage.urlSlug : "";
            const slug = parentSlug.apply({ urlSlug });
            return {
                id: subpackageNodeId.get(),
                type: "apiPackage",
                children: [],
                title: isSubpackage(subpackage)
                    ? subpackage.displayName ?? titleCase(subpackage.name)
                    : this.apiSection.title,
                slug: slug.get(),
                icon: undefined,
                hidden: undefined,
                overviewPageId: undefined,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined,
                noindex: undefined
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
                hidden: undefined
            },
            apiDefinitionPackageId,
            parentSlug,
            idgen
        );
    }

    #convertEndpoint(
        endpointItem: docsYml.ParsedApiReferenceLayoutItem.Endpoint,
        apiDefinitionPackageId: string | undefined,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageChild | undefined {
        const endpoint =
            (apiDefinitionPackageId != null
                ? this.#holder.subpackages.get(apiDefinitionPackageId)?.endpoints.get(endpointItem.endpoint)
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
                id: idgen.append(endpoint.id).get(),
                type: "endpoint",
                method: endpoint.method,
                endpointId,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.utils.convertAvailability(endpoint.availability),
                isResponseStream: endpoint.response?.type.type === "stream",
                title: endpointItem.title ?? endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
                slug: endpointSlug.get(),
                icon: endpointItem.icon,
                hidden: endpointItem.hidden
            };
        }

        const webSocket =
            (apiDefinitionPackageId != null
                ? this.#holder.subpackages.get(apiDefinitionPackageId)?.webSockets.get(endpointItem.endpoint)
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
                id: idgen.append(webSocket.id).get(),
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
                availability: FernNavigation.utils.convertAvailability(webSocket.availability)
            };
        }

        const webhook =
            (apiDefinitionPackageId != null
                ? this.#holder.subpackages.get(apiDefinitionPackageId)?.webhooks.get(endpointItem.endpoint)
                : undefined) ?? this.#holder.webhooks.get(FernNavigation.WebhookId(endpointItem.endpoint));

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
                id: idgen.append(webhook.id).get(),
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
                availability: undefined
            };
        }

        this.taskContext.logger.error("Unknown identifier in the API Reference layout: ", endpointItem.endpoint);

        return;
    }

    // Step 2

    #mergeAndFilterChildren(
        left: FernNavigation.ApiPackageChild[],
        right: FernNavigation.ApiPackageChild[]
    ): FernNavigation.ApiPackageChild[] {
        return this.mergeEndpointPairs([...left, ...right]).filter((child) =>
            child.type === "apiPackage" ? child.children.length > 0 : true
        );
    }

    #enrichApiPackageChild(child: FernNavigation.ApiPackageChild): FernNavigation.ApiPackageChild {
        if (child.type === "apiPackage") {
            // expand the subpackage to include children that haven't been visited yet
            const slug = FernNavigation.SlugGenerator.init(child.slug);
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
                pointsTo: FernNavigation.utils.followRedirects(children)
            };
        }
        return child;
    }

    #convertApiDefinitionPackage(
        pkg: APIV1Read.ApiDefinitionPackage,
        parentSlug: FernNavigation.SlugGenerator
    ): FernNavigation.ApiPackageChild[] {
        // if an endpoint, websocket, webhook, or subpackage is not visited, add it to the additional children list
        let additionalChildren: FernNavigation.ApiPackageChild[] = [];

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
                id: FernNavigation.NodeId(`${this.apiDefinitionId}:${endpointId}`),
                type: "endpoint",
                method: endpoint.method,
                endpointId,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.utils.convertAvailability(endpoint.availability),
                isResponseStream: endpoint.response?.type.type === "stream",
                title: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
                slug: endpointSlug.get(),
                icon: undefined,
                hidden: undefined
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
                id: FernNavigation.NodeId(`${this.apiDefinitionId}:${webSocketId}`),
                type: "webSocket",
                webSocketId,
                title: webSocket.name ?? stringifyEndpointPathParts(webSocket.path.parts),
                slug: parentSlug.apply(webSocket).get(),
                icon: undefined,
                hidden: undefined,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.utils.convertAvailability(webSocket.availability)
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
                id: FernNavigation.NodeId(`${this.apiDefinitionId}:${webhookId}`),
                type: "webhook",
                webhookId,
                method: webhook.method,
                title: webhook.name ?? titleCase(webhook.id),
                slug: parentSlug.apply(webhook).get(),
                icon: undefined,
                hidden: undefined,
                apiDefinitionId: this.apiDefinitionId,
                availability: undefined
            });
        });

        pkg.subpackages.forEach((subpackageId) => {
            if (this.#visitedSubpackages.has(subpackageId)) {
                return;
            }

            const subpackage = this.#holder.getSubpackage(subpackageId);
            if (subpackage == null) {
                this.taskContext.logger.error(`Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`);
                return;
            }

            const slug = isSubpackage(subpackage) ? parentSlug.apply(subpackage) : parentSlug;
            const subpackageChildren = this.#convertApiDefinitionPackageId(subpackageId, slug);
            if (subpackageChildren.length > 0) {
                additionalChildren.push({
                    id: FernNavigation.NodeId(`${this.apiDefinitionId}:${subpackageId}`),
                    type: "apiPackage",
                    children: subpackageChildren,
                    title: isSubpackage(subpackage)
                        ? subpackage.displayName ?? titleCase(subpackage.name)
                        : this.apiSection.title,
                    slug: slug.get(),
                    icon: undefined,
                    hidden: undefined,
                    overviewPageId: undefined,
                    availability: undefined,
                    apiDefinitionId: this.apiDefinitionId,
                    pointsTo: FernNavigation.utils.followRedirects(subpackageChildren),
                    noindex: undefined
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
        parentSlug: FernNavigation.SlugGenerator
    ): FernNavigation.ApiPackageChild[] {
        const pkg =
            packageId != null ? this.#holder.resolveSubpackage(this.#holder.getSubpackage(packageId)) : undefined;

        if (pkg == null) {
            this.taskContext.logger.error(`Subpackage ${packageId} not found in ${this.apiDefinitionId}`);
            return [];
        }

        // if an endpoint, websocket, webhook, or subpackage is not visited, add it to the additional children list
        return this.#convertApiDefinitionPackage(pkg, parentSlug);
    }

    private mergeEndpointPairs(children: FernNavigation.ApiPackageChild[]): FernNavigation.ApiPackageChild[] {
        if (this.disableEndpointPairs) {
            return children;
        }

        const toRet: FernNavigation.ApiPackageChild[] = [];

        const methodAndPathToEndpointNode = new Map<string, FernNavigation.EndpointNode>();
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
            const pairNode: FernNavigation.EndpointPairNode = {
                id: FernNavigation.NodeId(`${this.apiDefinitionId}:${nonStream.endpointId}+${stream.endpointId}`),
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
        return relative(this.docsWorkspace.absoluteFilepath, filepath);
    }
}
