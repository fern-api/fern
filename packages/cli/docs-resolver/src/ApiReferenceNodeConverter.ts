import { docsYml } from "@fern-api/configuration";
import { isNonNullish } from "@fern-api/core-utils";
import { APIV1Read, FernNavigation, titleCase, visitDiscriminatedUnion } from "@fern-api/fdr-sdk/dist";
import { AbsoluteFilePath, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { kebabCase } from "lodash-es";
import urlJoin from "url-join";
import { ApiDefinitionHolder } from "./ApiDefinitionHolder";
import { ChangelogNodeConverter } from "./ChangelogNodeConverter";
import { isSubpackage } from "./isSubpackage";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { stringifyEndpointPathParts } from "./stringifyEndpointPathParts";

export class ApiReferenceNodeConverter {
    apiDefinitionId: FernNavigation.ApiDefinitionId;
    #holder: ApiDefinitionHolder;
    #visitedEndpoints = new Set<FernNavigation.EndpointId>();
    #visitedWebSockets = new Set<FernNavigation.WebSocketId>();
    #visitedWebhooks = new Set<FernNavigation.WebhookId>();
    #visitedSubpackages = new Set<string>();
    #nodeIdToSubpackageId = new Map<string, string>();
    #children: FernNavigation.ApiPackageChild[] = [];
    #overviewPageId: FernNavigation.PageId | undefined;
    #slug: FernNavigation.SlugGenerator;
    constructor(
        private apiSection: docsYml.DocsNavigationItem.ApiSection,
        api: APIV1Read.ApiDefinition,
        parentSlug: FernNavigation.SlugGenerator,
        private workspace: FernWorkspace,
        private docsWorkspace: DocsWorkspace,
        private taskContext: TaskContext,
        private markdownFilesToFullSlugs: Map<AbsoluteFilePath, string>
    ) {
        this.apiDefinitionId = FernNavigation.ApiDefinitionId(api.id);
        this.#holder = ApiDefinitionHolder.create(api);

        // we are assuming that the apiDefinitionId is unique.
        const idgen = NodeIdGenerator.init(this.apiDefinitionId);

        this.#overviewPageId =
            this.apiSection.summaryAbsolutePath != null
                ? FernNavigation.PageId(this.toRelativeFilepath(this.apiSection.summaryAbsolutePath))
                : undefined;

        // the overview page markdown could contain a full slug, which would be used as the base slug for the API section.
        const maybeFullSlug =
            this.apiSection.summaryAbsolutePath != null
                ? this.markdownFilesToFullSlugs.get(this.apiSection.summaryAbsolutePath)
                : undefined;

        this.#slug = parentSlug.apply({
            fullSlug: maybeFullSlug?.split("/"),
            skipUrlSlug: this.apiSection.skipUrlSlug,
            urlSlug: this.apiSection.slug ?? kebabCase(this.apiSection.title)
        });

        // Step 1. Convert the navigation items that are manually defined in the API section.
        if (this.apiSection.navigation != null) {
            this.#children = this.#convertApiNavigationItems(
                this.apiSection.navigation,
                this.#holder.api.rootPackage,
                this.#slug,
                idgen
            );
        }

        // Step 2. Fill in the any missing navigation items from the API definition
        this.#children = this.#convertApiDefinitionPackage("root", this.#children, this.#slug, idgen);
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
            changelog: new ChangelogNodeConverter(this.workspace, this.docsWorkspace, idgen).convert(
                this.#slug,
                `${this.apiSection.title} Changelog`
            ),
            children: this.#children,
            availability: undefined,
            pointsTo
        };
    }

    #convertApiNavigationItems(
        navigation: docsYml.ParsedApiNavigationItem[],
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
                        return {
                            id: idgen.append(`page:${pageId}`).get(),
                            type: "page",
                            pageId,
                            title: page.title,
                            slug: parentSlug
                                .apply({
                                    fullSlug: this.markdownFilesToFullSlugs.get(page.absolutePath)?.split("/"),
                                    urlSlug: page.slug ?? kebabCase(page.title)
                                })
                                .get(),
                            icon: page.icon,
                            hidden: page.hidden
                        };
                    },
                    package: (pkg) => this.#convertPackage(pkg, parentSlug, idgen),
                    item: ({ value: unknownIdentifier }): FernNavigation.ApiPackageChild | undefined =>
                        this.#convertUnknownIdentifier(unknownIdentifier, apiDefinitionPackageId, parentSlug, idgen)
                })
            )
            .filter(isNonNullish);
    }

    #convertPackage(
        pkg: docsYml.ParsedApiNavigationItem.Package,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageNode {
        const subpackage = this.#holder.getSubpackage(pkg.package);

        const overviewPageId =
            pkg.summaryAbsolutePath != null
                ? FernNavigation.PageId(this.toRelativeFilepath(pkg.summaryAbsolutePath))
                : undefined;

        const maybeFullSlug =
            pkg.summaryAbsolutePath != null ? this.markdownFilesToFullSlugs.get(pkg.summaryAbsolutePath) : undefined;

        if (subpackage != null) {
            const subpackageId = ApiDefinitionHolder.getSubpackageId(subpackage);
            const subpackageNodeId = idgen.append(subpackageId);
            this.#visitedSubpackages.add(subpackageId);
            this.#nodeIdToSubpackageId.set(subpackageNodeId.get(), subpackageId);
            const urlSlug =
                pkg.slug ?? (isSubpackage(subpackage) ? subpackage.urlSlug : kebabCase(pkg.titleOverride ?? ""));
            const slug = parentSlug.apply({
                fullSlug: maybeFullSlug?.split("/"),
                skipUrlSlug: pkg.skipUrlSlug,
                urlSlug
            });
            const convertedItems = this.#convertApiNavigationItems(pkg.contents, subpackage, slug, subpackageNodeId);
            return {
                id: subpackageNodeId.get(),
                type: "apiPackage",
                children: convertedItems,
                title:
                    pkg.titleOverride ??
                    (isSubpackage(subpackage)
                        ? subpackage.displayName ?? titleCase(subpackage.name)
                        : this.apiSection.title),
                slug: slug.get(),
                icon: pkg.icon,
                hidden: pkg.hidden,
                overviewPageId,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined
            };
        } else {
            const urlSlug = pkg.slug ?? kebabCase(pkg.titleOverride ?? pkg.package);
            const slug = parentSlug.apply({
                fullSlug: maybeFullSlug?.split("/"),
                skipUrlSlug: pkg.skipUrlSlug,
                urlSlug
            });
            const convertedItems = this.#convertApiNavigationItems(pkg.contents, subpackage, slug, idgen);
            return {
                id: idgen.append(kebabCase(pkg.package)).get(),
                type: "apiPackage",
                children: convertedItems,
                title: pkg.titleOverride ?? pkg.package,
                slug: slug.get(),
                icon: pkg.icon,
                hidden: pkg.hidden,
                overviewPageId,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined
            };
        }
    }

    #convertApiDefinitionPackage(
        packageId: string | undefined,
        children: FernNavigation.ApiPackageChild[],
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageChild[] {
        const pkg =
            packageId != null ? this.#holder.resolveSubpackage(this.#holder.getSubpackage(packageId)) : undefined;

        // if an endpoint, websocket, webhook, or subpackage is not visited, add it to the additional children list
        const additionalChildren: FernNavigation.ApiPackageChild[] = [];

        pkg?.endpoints.forEach((endpoint) => {
            const endpointId = this.#holder.getEndpointId(endpoint);
            if (endpointId == null) {
                throw new Error(`Expected Endpoint ID for ${endpoint.id}. Got undefined.`);
            }
            if (this.#visitedEndpoints.has(endpointId)) {
                return;
            }
            children.push({
                id: idgen.append(endpoint.id).get(),
                type: "endpoint",
                method: endpoint.method,
                endpointId,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.utils.convertAvailability(endpoint.availability),
                isResponseStream: endpoint.response?.type.type === "stream",
                title: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
                slug: parentSlug.apply(endpoint).get(),
                icon: undefined,
                hidden: undefined
            });
        });

        pkg?.websockets.forEach((webSocket) => {
            const webSocketId = this.#holder.getWebSocketId(webSocket);
            if (webSocketId == null) {
                throw new Error(`Expected WebSocket ID for ${webSocket.id}. Got undefined.`);
            }
            if (this.#visitedWebSockets.has(webSocketId)) {
                return;
            }
            children.push({
                id: idgen.append(webSocket.id).get(),
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

        pkg?.webhooks.forEach((webhook) => {
            const webhookId = this.#holder.getWebhookId(webhook);
            if (webhookId == null) {
                throw new Error(`Expected Webhook ID for ${webhook.id}. Got undefined.`);
            }
            if (this.#visitedWebhooks.has(webhookId)) {
                return;
            }
            children.push({
                id: idgen.append(webhook.id).get(),
                type: "webhook",
                webhookId,
                method: webhook.method,
                title: webhook.name ?? urlJoin("/", ...webhook.path),
                slug: parentSlug.apply(webhook).get(),
                icon: undefined,
                hidden: undefined,
                apiDefinitionId: this.apiDefinitionId,
                availability: undefined
            });
        });

        pkg?.subpackages.forEach((subpackageId) => {
            if (this.#visitedSubpackages.has(subpackageId)) {
                return;
            }
            const subpackage = this.#holder.getSubpackage(subpackageId);
            if (subpackage == null) {
                // eslint-disable-next-line no-console
                console.error(`Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`);
                return;
            }

            const subpackageNodeId = idgen.append(subpackageId);
            const slug = isSubpackage(subpackage) ? parentSlug.apply(subpackage) : parentSlug;
            children.push({
                id: subpackageNodeId.get(),
                type: "apiPackage",
                children: this.#convertApiDefinitionPackage(subpackageId, [], slug, subpackageNodeId),
                title: isSubpackage(subpackage)
                    ? subpackage.displayName ?? titleCase(subpackage.name)
                    : this.apiSection.title,
                slug: slug.get(),
                icon: undefined,
                hidden: undefined,
                overviewPageId: undefined,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined
            });
        });

        if (this.apiSection.alphabetized) {
            additionalChildren.sort((a, b) => {
                const aTitle = a.type === "endpointPair" ? a.nonStream.title : a.title;
                const bTitle = b.type === "endpointPair" ? b.nonStream.title : b.title;
                return aTitle.localeCompare(bTitle);
            });
        }

        let toRet = [
            ...children.map((child) => {
                if (child.type === "apiPackage") {
                    const subpackageId = this.#nodeIdToSubpackageId.get(child.id);
                    const newChildren = this.#convertApiDefinitionPackage(
                        subpackageId,
                        child.children,
                        parentSlug.set(child.slug),
                        idgen.append(subpackageId ?? kebabCase(child.title))
                    );

                    return {
                        ...child,
                        children: newChildren,
                        pointsTo: FernNavigation.utils.followRedirects(newChildren)
                    };
                }
                return child;
            }),
            ...additionalChildren
        ];

        toRet = this.mergeEndpointPairs(toRet, idgen);

        return toRet;
    }

    #convertUnknownIdentifier(
        unknownIdentifier: string,
        apiDefinitionPackageId: string | undefined,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageChild | undefined {
        // unknownIdentifier could either be a package, endpoint, websocket, or webhook.
        // We need to determine which one it is.
        const subpackage = this.#holder.getSubpackage(unknownIdentifier);
        if (subpackage != null) {
            const subpackageId = ApiDefinitionHolder.getSubpackageId(subpackage);
            const subpackageNodeId = idgen.append(subpackageId);
            this.#visitedSubpackages.add(subpackageId);
            this.#nodeIdToSubpackageId.set(subpackageNodeId.get(), subpackageId);
            const urlSlug = isSubpackage(subpackage) ? subpackage.urlSlug : "";
            const slug = parentSlug.apply({ urlSlug });
            return {
                id: subpackageNodeId.get(),
                type: "apiPackage",
                children: [],
                title: unknownIdentifier,
                slug: slug.get(),
                icon: undefined,
                hidden: undefined,
                overviewPageId: undefined,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined
            };
        }

        const endpoint =
            (apiDefinitionPackageId != null
                ? this.#holder.subpackages.get(apiDefinitionPackageId)?.endpoints.get(unknownIdentifier)
                : undefined) ??
            this.#holder.endpoints.get(FernNavigation.EndpointId(unknownIdentifier)) ??
            this.#holder.endpointsByPath.get(unknownIdentifier);

        if (endpoint != null) {
            const endpointId = this.#holder.getEndpointId(endpoint);
            if (endpointId == null) {
                throw new Error(`Expected Endpoint ID for ${endpoint.id}. Got undefined.`);
            }
            this.#visitedEndpoints.add(endpointId);
            return {
                id: idgen.append(endpoint.id).get(),
                type: "endpoint",
                method: endpoint.method,
                endpointId,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.utils.convertAvailability(endpoint.availability),
                isResponseStream: endpoint.response?.type.type === "stream",
                title: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
                slug: parentSlug.apply(endpoint).get(),
                icon: undefined,
                hidden: undefined
            };
        }

        const webSocket =
            (apiDefinitionPackageId != null
                ? this.#holder.subpackages.get(apiDefinitionPackageId)?.webSockets.get(unknownIdentifier)
                : undefined) ??
            this.#holder.webSockets.get(FernNavigation.WebSocketId(unknownIdentifier)) ??
            this.#holder.webSocketsByPath.get(unknownIdentifier);

        if (webSocket != null) {
            const webSocketId = this.#holder.getWebSocketId(webSocket);
            if (webSocketId == null) {
                throw new Error(`Expected WebSocket ID for ${webSocket.id}. Got undefined.`);
            }
            this.#visitedWebSockets.add(webSocketId);
            return {
                id: idgen.append(webSocket.id).get(),
                type: "webSocket",
                webSocketId,
                title: webSocket.name ?? stringifyEndpointPathParts(webSocket.path.parts),
                slug: parentSlug.apply(webSocket).get(),
                icon: undefined,
                hidden: undefined,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.utils.convertAvailability(webSocket.availability)
            };
        }

        // TODO: webhook by path is not implemented yet
        const webhook =
            (apiDefinitionPackageId != null
                ? this.#holder.subpackages.get(apiDefinitionPackageId)?.webhooks.get(unknownIdentifier)
                : undefined) ?? this.#holder.webhooks.get(FernNavigation.WebhookId(unknownIdentifier));

        if (webhook != null) {
            const webhookId = this.#holder.getWebhookId(webhook);
            if (webhookId == null) {
                throw new Error(`Expected Webhook ID for ${webhook.id}. Got undefined.`);
            }
            this.#visitedWebhooks.add(webhookId);
            return {
                id: idgen.append(webhook.id).get(),
                type: "webhook",
                webhookId,
                method: webhook.method,
                title: webhook.name ?? urlJoin("/", ...webhook.path),
                slug: parentSlug.apply(webhook).get(),
                icon: undefined,
                hidden: undefined,
                apiDefinitionId: this.apiDefinitionId,
                availability: undefined
            };
        }

        this.taskContext.logger.warn(
            "Unknown identifier in the API Reference layout: ",
            unknownIdentifier,
            "Skipping..."
        );

        return;
    }

    private mergeEndpointPairs(
        children: FernNavigation.ApiPackageChild[],
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageChild[] {
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

            if (
                existing == null ||
                toRet.indexOf(existing) === -1 ||
                existing.isResponseStream === child.isResponseStream
            ) {
                toRet.push(child);
                return;
            }

            const idx = toRet.indexOf(existing);
            const pairNode: FernNavigation.EndpointPairNode = {
                id: idgen.append(`${child.endpointId}:pair`).get(),
                type: "endpointPair",
                stream: child.isResponseStream ? child : existing,
                nonStream: child.isResponseStream ? existing : child
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
