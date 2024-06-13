import { docsYml } from "@fern-api/configuration";
import { noop } from "@fern-api/core-utils";
import { APIV1Read, FernNavigation, titleCase, visitDiscriminatedUnion } from "@fern-api/fdr-sdk/dist";
import { AbsoluteFilePath, relative, RelativeFilePath } from "@fern-api/fs-utils";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { kebabCase } from "lodash-es";
import urljoin from "url-join";
import { isSubpackage } from "./isSubpackage";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { stringifyEndpointPathParts } from "./stringifyEndpointPathParts";

export class ApiReferenceNodeConverter {
    public static convert(
        apiSection: docsYml.DocsNavigationItem.ApiSection,
        api: APIV1Read.ApiDefinition,
        parentSlug: FernNavigation.SlugGenerator,
        docsWorkspace: DocsWorkspace
    ) {
        return new ApiReferenceNodeConverter(apiSection, api, parentSlug, docsWorkspace).convert();
    }

    apiDefinitionId: FernNavigation.ApiDefinitionId;
    #holder: FernNavigation.ApiDefinitionHolder;
    #visitedEndpoints = new Set<FernNavigation.EndpointId>();
    #visitedWebSockets = new Set<FernNavigation.WebSocketId>();
    #visitedWebhooks = new Set<FernNavigation.WebhookId>();
    #visitedSubpackages = new Set<string>();
    private constructor(
        private apiSection: docsYml.DocsNavigationItem.ApiSection,
        private api: APIV1Read.ApiDefinition,
        private parentSlug: FernNavigation.SlugGenerator,
        private docsWorkspace: DocsWorkspace
    ) {
        this.apiDefinitionId = FernNavigation.ApiDefinitionId(api.id);
        this.#holder = FernNavigation.ApiDefinitionHolder.create(api);
    }

    private convert(): FernNavigation.ApiReferenceNode {
        const idgen = NodeIdGenerator.init(this.apiDefinitionId);
        const overviewPageId =
            this.apiSection.summaryAbsolutePath != null
                ? FernNavigation.PageId(this.toRelativeFilepath(this.apiSection.summaryAbsolutePath))
                : undefined;

        const slug = this.apiSection.skipUrlSlug
            ? this.parentSlug
            : this.parentSlug.append(this.apiSection.slug ?? kebabCase(this.apiSection.title));
        const children = this.convertChildren(slug, idgen);
        // const changelog =
        //     this.apiSection.changelog != null
        //         ? FernNavigation.ChangelogNavigationConverter.convert(this.apiSection.changelog, slug, idgen)
        //         : undefined;
        // const pointsTo = FernNavigation.utils.followRedirects(children) ?? changelog?.slug;
        return {
            id: idgen.get(),
            type: "apiReference",
            title: this.apiSection.title,
            apiDefinitionId: FernNavigation.ApiDefinitionId(this.apiDefinitionId),
            overviewPageId,
            disableLongScrolling: this.apiSection.paginated,
            slug: slug.get(),
            icon: this.apiSection.icon,
            hidden: this.apiSection.hidden,
            hideTitle: this.apiSection.flattened,
            showErrors: this.apiSection.showErrors,
            changelog: undefined,
            children,
            availability: undefined,
            pointsTo: undefined
        };
    }

    private convertChildren(
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageChild[] {
        if (this.apiSection.navigation != null) {
            return this.convertApiNavigationItems(this.apiSection.navigation, parentSlug, "root", idgen);
        }

        return this.convertPackageToChildren(this.api.rootPackage, parentSlug, idgen);
    }

    private convertEndpointNode(
        endpointId: FernNavigation.EndpointId,
        endpoint: APIV1Read.EndpointDefinition,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.EndpointNode | FernNavigation.EndpointPairNode {
        return {
            id: idgen.append(endpointId).get(),
            type: "endpoint",
            title: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
            endpointId,
            slug: parentSlug.apply(endpoint).get(),
            icon: undefined,
            hidden: undefined,
            method: endpoint.method,
            apiDefinitionId: this.apiDefinitionId,
            availability: FernNavigation.utils.convertAvailability(endpoint.availability),
            isResponseStream: endpoint.response?.type.type === "stream"
        };
    }

    private convertWebSocketNode(
        webSocketId: FernNavigation.WebSocketId,
        webSocket: APIV1Read.WebSocketChannel,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.WebSocketNode {
        return {
            id: idgen.append(webSocketId).get(),
            type: "webSocket",
            title: webSocket.name ?? stringifyEndpointPathParts(webSocket.path.parts),
            webSocketId,
            slug: parentSlug.apply(webSocket).get(),
            icon: undefined,
            hidden: undefined,
            apiDefinitionId: this.apiDefinitionId,
            availability: FernNavigation.utils.convertAvailability(webSocket.availability)
        };
    }

    private convertWebhookNode(
        webhookId: FernNavigation.WebhookId,
        webhook: APIV1Read.WebhookDefinition,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.WebhookNode {
        return {
            id: idgen.append(webhookId).get(),
            type: "webhook",
            title: webhook.name ?? urljoin("/", ...webhook.path),
            webhookId,
            slug: parentSlug.apply(webhook).get(),
            icon: undefined,
            hidden: undefined,
            method: webhook.method,
            apiDefinitionId: this.apiDefinitionId,
            availability: undefined
        };
    }

    private convertPackageToChildren(
        package_: APIV1Read.ApiDefinitionPackage,
        parentSlug: FernNavigation.SlugGenerator,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageChild[] {
        const children: FernNavigation.ApiPackageChild[] = [];

        let subpackageId = isSubpackage(package_) ? package_.subpackageId : "root";
        while (package_.pointsTo != null) {
            subpackageId = package_.pointsTo;
            if (this.api.subpackages[package_.pointsTo] == null) {
                return [];
            }
            package_ = this.api.subpackages[package_.pointsTo]!;
        }

        idgen = idgen.append(subpackageId);

        if (this.#visitedSubpackages.has(subpackageId)) {
            return children;
        }

        package_.endpoints.forEach((endpoint) => {
            const endpointId = FernNavigation.ApiDefinitionHolder.createEndpointId(endpoint, subpackageId);
            if (this.#visitedEndpoints.has(endpointId)) {
                return;
            }
            children.push(this.convertEndpointNode(endpointId, endpoint, parentSlug, idgen));
            this.#visitedEndpoints.add(endpointId);
        });

        package_.websockets.forEach((webSocket) => {
            const webSocketId = FernNavigation.ApiDefinitionHolder.createWebSocketId(webSocket, subpackageId);
            if (this.#visitedWebSockets.has(webSocketId)) {
                return;
            }
            children.push(this.convertWebSocketNode(webSocketId, webSocket, parentSlug, idgen));
            this.#visitedWebSockets.add(webSocketId);
        });

        package_.webhooks.forEach((webhook) => {
            const webhookId = FernNavigation.ApiDefinitionHolder.createWebhookId(webhook, subpackageId);
            if (this.#visitedWebhooks.has(webhookId)) {
                return;
            }
            children.push(this.convertWebhookNode(webhookId, webhook, parentSlug, idgen));
            this.#visitedWebhooks.add(webhookId);
        });

        package_.subpackages.forEach((subpackageId) => {
            const subpackage = this.api.subpackages[subpackageId];
            if (subpackage == null) {
                // eslint-disable-next-line no-console
                console.error(`Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`);
                return;
            }
            const slug = parentSlug.apply(subpackage);
            const subpackageChildren = this.convertPackageToChildren(subpackage, slug, idgen);
            if (subpackageChildren.length === 0) {
                return;
            }
            const pointsTo = FernNavigation.utils.followRedirects(subpackageChildren);
            const child: FernNavigation.ApiPackageNode = {
                id: idgen.append(subpackageId).get(),
                type: "apiPackage",
                children: subpackageChildren,
                title: subpackage.displayName ?? titleCase(subpackage.name),
                slug: slug.get(),
                icon: undefined,
                hidden: undefined,
                overviewPageId: undefined,
                availability: undefined,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo
            };
            children.push(child);
        });

        this.#visitedSubpackages.add(subpackageId);

        const toRet = this.mergeEndpointPairs(children, idgen);

        if (this.apiSection.alphabetized) {
            toRet.sort((a, b) => {
                const aTitle = a.type === "endpointPair" ? a.nonStream.title : a.title;
                const bTitle = b.type === "endpointPair" ? b.nonStream.title : b.title;
                return aTitle.localeCompare(bTitle);
            });
        }

        return toRet;
    }

    private convertApiNavigationItems(
        items: docsYml.ParsedApiNavigationItem[],
        parentSlug: FernNavigation.SlugGenerator,
        subpackageId: string,
        idgen: NodeIdGenerator
    ): FernNavigation.ApiPackageChild[] {
        const children: FernNavigation.ApiPackageChild[] = [];
        let subpackage = subpackageId === "root" ? this.api.rootPackage : this.api.subpackages[subpackageId];
        if (subpackage == null) {
            return [];
        }
        while (subpackage.pointsTo != null) {
            subpackage = this.api.subpackages[subpackage.pointsTo];
            if (subpackage == null) {
                return [];
            }
        }
        idgen = idgen.append(subpackageId);
        const targetSubpackageId = isSubpackage(subpackage) ? subpackage.subpackageId : "root";
        const endpoints = new Map<string, APIV1Read.EndpointDefinition>();
        const webSockets = new Map<string, APIV1Read.WebSocketChannel>();
        const webhooks = new Map<string, APIV1Read.WebhookDefinition>();
        subpackage.endpoints.forEach((endpoint) => {
            endpoints.set(endpoint.id, endpoint);
        });
        subpackage.websockets.forEach((webSocket) => {
            webSockets.set(webSocket.id, webSocket);
        });
        subpackage.webhooks.forEach((webhook) => {
            webhooks.set(webhook.id, webhook);
        });
        items.forEach((item) => {
            visitDiscriminatedUnion(item)._visit({
                page: (page) => {
                    children.push({
                        id: idgen.append(page.id).get(),
                        type: "page",
                        title: page.title,
                        pageId: FernNavigation.PageId(page.id),
                        slug: parentSlug.apply(page).get(),
                        icon: page.icon,
                        hidden: page.hidden
                    });
                },
                endpointId: (oldEndpointId) => {
                    const endpoint = endpoints.get(oldEndpointId.value);
                    if (endpoint == null) {
                        // eslint-disable-next-line no-console
                        console.error(`Endpoint ${oldEndpointId.value} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const endpointId = FernNavigation.ApiDefinitionHolder.createEndpointId(
                        endpoint,
                        targetSubpackageId
                    );
                    children.push(this.convertEndpointNode(endpointId, endpoint, parentSlug, idgen));
                    this.#visitedEndpoints.add(endpointId);
                },
                websocketId: (oldWebSocketId) => {
                    const webSocket = webSockets.get(oldWebSocketId.value);
                    if (webSocket == null) {
                        // eslint-disable-next-line no-console
                        console.error(`WebSocket ${oldWebSocketId.value} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const webSocketId = FernNavigation.ApiDefinitionHolder.createWebSocketId(
                        webSocket,
                        targetSubpackageId
                    );
                    children.push(this.convertWebSocketNode(webSocketId, webSocket, parentSlug, idgen));
                    this.#visitedWebSockets.add(webSocketId);
                },
                webhookId: (oldWebhookId) => {
                    const webhook = webhooks.get(oldWebhookId.value);
                    if (webhook == null) {
                        // eslint-disable-next-line no-console
                        console.error(`Webhook ${oldWebhookId.value} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const webhookId = FernNavigation.ApiDefinitionHolder.createWebhookId(webhook, targetSubpackageId);
                    children.push(this.convertWebhookNode(webhookId, webhook, parentSlug, idgen));
                    this.#visitedWebhooks.add(webhookId);
                },
                subpackage: ({ subpackageId, items, summaryPageId }) => {
                    const subpackage = this.api.subpackages[subpackageId];
                    if (subpackage == null) {
                        // eslint-disable-next-line no-console
                        console.error(`Subpackage ${subpackageId} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const slug = parentSlug.apply(subpackage);
                    const convertedItems = this.convertApiNavigationItems(items, slug, subpackageId, idgen);
                    children.push({
                        id: idgen.append(subpackageId).get(),
                        type: "apiPackage",
                        children: convertedItems,
                        title: subpackage.displayName ?? titleCase(subpackage.name),
                        slug: slug.get(),
                        icon: undefined,
                        hidden: undefined,
                        overviewPageId: summaryPageId != null ? FernNavigation.PageId(summaryPageId) : undefined,
                        availability: undefined,
                        apiDefinitionId: this.apiDefinitionId,
                        pointsTo: FernNavigation.utils.followRedirects(convertedItems)
                    });
                },
                _other: noop
            });
        });

        children.push(...this.convertPackageToChildren(subpackage, parentSlug, idgen));
        return this.mergeEndpointPairs(children, idgen);
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
