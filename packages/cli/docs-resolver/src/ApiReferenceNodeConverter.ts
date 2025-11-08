import { docsYml } from "@fern-api/configuration-loader";
import { isNonNullish } from "@fern-api/core-utils";
import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { titleCase, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";
import { camelCase, kebabCase } from "lodash-es";
import urlJoin from "url-join";

import { ApiDefinitionHolder } from "./ApiDefinitionHolder";
import { ChangelogNodeConverter } from "./ChangelogNodeConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { convertPlaygroundSettings } from "./utils/convertPlaygroundSettings";
import { enrichApiPackageChild } from "./utils/enrichApiPackageChild";
import { cannotFindSubpackageByLocatorError, packageReuseError } from "./utils/errorMessages";
import { isSubpackage } from "./utils/isSubpackage";
import { mergeAndFilterChildren } from "./utils/mergeAndFilterChildren";
import { mergeEndpointPairs } from "./utils/mergeEndpointPairs";
import { stringifyEndpointPathParts, stringifyEndpointPathPartsWithMethod } from "./utils/stringifyEndpointPathParts";
import { toPageNode } from "./utils/toPageNode";
import { toRelativeFilepath } from "./utils/toRelativeFilepath";

const NUM_NEAREST_SUBPACKAGES = 1;

export class ApiReferenceNodeConverter {
    apiDefinitionId: FernNavigation.V1.ApiDefinitionId;
    #holder: ApiDefinitionHolder;
    #visitedEndpoints = new Set<FernNavigation.V1.EndpointId>();
    #visitedWebSockets = new Set<FernNavigation.V1.WebSocketId>();
    #visitedWebhooks = new Set<FernNavigation.V1.WebhookId>();
    #visitedGrpcs = new Set<FernNavigation.V1.GrpcId>();
    #visitedSubpackages = new Set<string>();
    #nodeIdToSubpackageId = new Map<string, string[]>();
    #children: FernNavigation.V1.ApiPackageChild[] = [];
    #overviewPageId: FernNavigation.V1.PageId | undefined;
    #slug: FernNavigation.V1.SlugGenerator;
    #idgen: NodeIdGenerator;
    private disableEndpointPairs;
    private collectedFileIds = new Map<AbsoluteFilePath, string>();
    constructor(
        private apiSection: docsYml.DocsNavigationItem.ApiSection,
        api: APIV1Read.ApiDefinition,
        parentSlug: FernNavigation.V1.SlugGenerator,
        private docsWorkspace: DocsWorkspace,
        private taskContext: TaskContext,
        private markdownFilesToFullSlugs: Map<AbsoluteFilePath, string>,
        private markdownFilesToNoIndex: Map<AbsoluteFilePath, boolean>,
        private markdownFilesToTags: Map<AbsoluteFilePath, string[]>,
        idgen: NodeIdGenerator,
        collectedFileIds: Map<AbsoluteFilePath, string>,
        private workspace?: FernWorkspace,
        private hideChildren?: boolean,
        private parentAvailability?: docsYml.RawSchemas.Availability
    ) {
        this.disableEndpointPairs = docsWorkspace.config.experimental?.disableStreamToggle ?? false;
        this.apiDefinitionId = FernNavigation.V1.ApiDefinitionId(api.id);
        this.#holder = ApiDefinitionHolder.create(api, taskContext);
        this.collectedFileIds = collectedFileIds;

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

        const apiSectionAvailability = this.apiSection.availability ?? this.parentAvailability;

        // Step 1. Convert the navigation items that are manually defined in the API section.
        if (this.apiSection.navigation != null) {
            this.#children = this.#convertApiReferenceLayoutItems(
                this.apiSection.navigation,
                this.#holder.api.rootPackage,
                this.#slug,
                apiSectionAvailability
            );
        }

        // Step 2. Fill in the any missing navigation items from the API definition
        this.#children = this.#mergeAndFilterChildren(
            this.#children.map((child) => this.#enrichApiPackageChild(child, apiSectionAvailability)),
            this.#convertApiDefinitionPackage(this.#holder.api.rootPackage, this.#slug, apiSectionAvailability)
        );
    }

    public get(): FernNavigation.V1.ApiReferenceNode {
        const pointsTo = FernNavigation.V1.followRedirects(this.#children);
        const changelogNodeConverter = new ChangelogNodeConverter(
            this.markdownFilesToFullSlugs,
            this.markdownFilesToNoIndex,
            this.markdownFilesToTags,
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
            icon: this.resolveIconFileId(this.apiSection.icon),
            hidden: this.hideChildren || this.apiSection.hidden,
            hideTitle: this.apiSection.flattened,
            showErrors: this.apiSection.showErrors,
            changelog: changelogNodeConverter?.toChangelogNode({
                parentSlug: this.#slug,
                viewers: undefined,
                hidden: this.hideChildren
            }),
            children: this.#children,
            availability: this.apiSection.availability ?? this.parentAvailability,
            pointsTo,
            noindex: undefined,
            playground: this.#convertPlaygroundSettings(this.apiSection.playground),
            // postmanCollectionUrl: this.apiSection.postman,
            authed: undefined,
            viewers: this.apiSection.viewers,
            orphaned: this.apiSection.orphaned,
            featureFlags: this.apiSection.featureFlags
        };
    }

    // Step 1

    #convertApiReferenceLayoutItems(
        navigation: docsYml.ParsedApiReferenceLayoutItem[],
        apiDefinitionPackage: APIV1Read.ApiDefinitionPackage | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator,
        parentAvailability?: docsYml.RawSchemas.Availability
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
                        icon: this.resolveIconFileId(link.icon),
                        url: FernNavigation.Url(link.url)
                    }),
                    page: (page) => this.#toPageNode(page, parentSlug, parentAvailability),
                    package: (pkg) => this.#convertPackage(pkg, parentSlug, parentAvailability),
                    section: (section) => this.#convertSection(section, parentSlug, parentAvailability),
                    item: ({ value: unknownIdentifier }): FernNavigation.V1.ApiPackageChild | undefined =>
                        this.#convertUnknownIdentifier(
                            unknownIdentifier,
                            apiDefinitionPackageId,
                            parentSlug,
                            parentAvailability
                        ),
                    endpoint: (endpoint) =>
                        this.#convertEndpoint(endpoint, apiDefinitionPackageId, parentSlug, parentAvailability)
                })
            )
            .filter(isNonNullish);
    }

    #toPageNode(
        page: docsYml.DocsNavigationItem.Page,
        parentSlug: FernNavigation.V1.SlugGenerator,
        parentAvailability?: docsYml.RawSchemas.Availability
    ): FernNavigation.V1.PageNode {
        return toPageNode({
            page: {
                ...page,
                availability: page.availability ?? parentAvailability
            },
            parentSlug,
            docsWorkspace: this.docsWorkspace,
            markdownFilesToFullSlugs: this.markdownFilesToFullSlugs,
            markdownFilesToNoIndex: this.markdownFilesToNoIndex,
            idgen: this.#idgen,
            hideChildren: this.hideChildren,
            resolveIconFileId: this.resolveIconFileId.bind(this)
        });
    }

    #convertPackage(
        pkg: docsYml.ParsedApiReferenceLayoutItem.Package,
        parentSlug: FernNavigation.V1.SlugGenerator,
        parentAvailability?: docsYml.RawSchemas.Availability
    ): FernNavigation.V1.ApiPackageNode {
        const overviewPageId =
            pkg.overviewAbsolutePath != null
                ? FernNavigation.V1.PageId(toRelativeFilepath(this.docsWorkspace, pkg.overviewAbsolutePath))
                : undefined;

        const maybeFullSlug =
            pkg.overviewAbsolutePath != null ? this.markdownFilesToFullSlugs.get(pkg.overviewAbsolutePath) : undefined;

        const pkgAvailability = pkg.availability ?? parentAvailability;

        const subpackage = this.#holder.getSubpackageByIdOrLocator(pkg.package);

        if (subpackage != null) {
            const subpackageId = ApiDefinitionHolder.getSubpackageId(subpackage);
            const subpackageNodeId = this.#idgen.get(overviewPageId ?? `${this.apiDefinitionId}:${subpackageId}`);

            if (this.#visitedSubpackages.has(subpackageId)) {
                this.taskContext.logger.warn(packageReuseError(pkg.package));
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
            const convertedItems = this.#convertApiReferenceLayoutItems(
                pkg.contents,
                subpackage,
                slug,
                pkgAvailability
            );
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
                icon: this.resolveIconFileId(pkg.icon),
                hidden: this.hideChildren || pkg.hidden,
                overviewPageId,
                availability: pkgAvailability,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined,
                noindex: undefined,
                playground: this.#convertPlaygroundSettings(pkg.playground),
                authed: undefined,
                viewers: pkg.viewers,
                orphaned: pkg.orphaned,
                featureFlags: pkg.featureFlags
            };
        } else {
            this.taskContext.logger.warn(
                cannotFindSubpackageByLocatorError(pkg.package, this.#holder.subpackageLocators)
            );
            const urlSlug = pkg.slug ?? kebabCase(pkg.package);
            const slug = parentSlug.apply({
                fullSlug: maybeFullSlug?.split("/"),
                skipUrlSlug: pkg.skipUrlSlug,
                urlSlug
            });
            const convertedItems = this.#convertApiReferenceLayoutItems(pkg.contents, undefined, slug, pkgAvailability);
            return {
                id: this.#idgen.get(overviewPageId ?? `${this.apiDefinitionId}:${kebabCase(pkg.package)}`),
                type: "apiPackage",
                children: convertedItems,
                title: pkg.title ?? pkg.package,
                slug: slug.get(),
                icon: this.resolveIconFileId(pkg.icon),
                hidden: this.hideChildren || pkg.hidden,
                overviewPageId,
                availability: pkgAvailability,
                apiDefinitionId: this.apiDefinitionId,
                pointsTo: undefined,
                noindex: undefined,
                playground: this.#convertPlaygroundSettings(pkg.playground),
                authed: undefined,
                viewers: pkg.viewers,
                orphaned: pkg.orphaned,
                featureFlags: pkg.featureFlags
            };
        }
    }

    #convertSection(
        section: docsYml.ParsedApiReferenceLayoutItem.Section,
        parentSlug: FernNavigation.V1.SlugGenerator,
        parentAvailability?: docsYml.RawSchemas.Availability
    ): FernNavigation.V1.ApiPackageNode {
        const overviewPageId =
            section.overviewAbsolutePath != null
                ? FernNavigation.V1.PageId(toRelativeFilepath(this.docsWorkspace, section.overviewAbsolutePath))
                : undefined;

        const maybeFullSlug =
            section.overviewAbsolutePath != null
                ? this.markdownFilesToFullSlugs.get(section.overviewAbsolutePath)
                : undefined;

        const noindex =
            section.overviewAbsolutePath != null
                ? this.markdownFilesToNoIndex.get(section.overviewAbsolutePath)
                : undefined;

        const nodeId = this.#idgen.get(overviewPageId ?? maybeFullSlug ?? parentSlug.get());

        const subPackageTuples = section.referencedSubpackages
            .map((locator) => {
                const subpackage = this.#holder.getSubpackageByIdOrLocator(locator);
                const subpackageId = subpackage != null ? ApiDefinitionHolder.getSubpackageId(subpackage) : undefined;
                if (subpackageId === undefined) {
                    this.taskContext.logger.error(
                        cannotFindSubpackageByLocatorError(locator, this.#holder.subpackageLocators)
                    );
                    return undefined;
                }
                return { subpackageId, locator };
            })
            .filter((subPackageTuple) => subPackageTuple != undefined)
            .filter(isNonNullish);

        this.#nodeIdToSubpackageId.set(
            nodeId,
            subPackageTuples.map((subPackageTuple) => subPackageTuple.subpackageId)
        );
        subPackageTuples.forEach((subPackageTuple) => {
            if (this.#visitedSubpackages.has(subPackageTuple.subpackageId)) {
                this.taskContext.logger.error(packageReuseError(subPackageTuple.locator));
            }
            this.#visitedSubpackages.add(subPackageTuple.subpackageId);
        });

        const urlSlug = section.slug ?? kebabCase(section.title);
        const slug = parentSlug.apply({
            fullSlug: maybeFullSlug?.split("/"),
            skipUrlSlug: section.skipUrlSlug,
            urlSlug
        });
        const sectionAvailability = section.availability ?? parentAvailability;
        const convertedItems = this.#convertApiReferenceLayoutItems(
            section.contents,
            undefined,
            slug,
            sectionAvailability
        );
        return {
            id: nodeId,
            type: "apiPackage",
            children: convertedItems,
            title: section.title,
            slug: slug.get(),
            icon: this.resolveIconFileId(section.icon),
            hidden: this.hideChildren || section.hidden,
            overviewPageId,
            availability: sectionAvailability,
            apiDefinitionId: this.apiDefinitionId,
            pointsTo: undefined,
            noindex,
            playground: this.#convertPlaygroundSettings(section.playground),
            authed: undefined,
            viewers: section.viewers,
            orphaned: section.orphaned,
            featureFlags: section.featureFlags
        };
    }

    #convertUnknownIdentifier(
        unknownIdentifier: string,
        apiDefinitionPackageId: string | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator,
        parentAvailability?: docsYml.RawSchemas.Availability
    ): FernNavigation.V1.ApiPackageChild | undefined {
        unknownIdentifier = unknownIdentifier.trim();
        // unknownIdentifier could either be a package, endpoint, websocket, or webhook.
        // We need to determine which one it is.
        const subpackage =
            this.#holder.getSubpackageByIdOrLocator(unknownIdentifier) ??
            this.#holder.getSubpackageByIdOrLocator(camelCase(unknownIdentifier));
        if (subpackage != null) {
            const subpackageId = ApiDefinitionHolder.getSubpackageId(subpackage);
            const subpackageNodeId = this.#idgen.get(`${this.apiDefinitionId}:${subpackageId}`);

            if (this.#visitedSubpackages.has(subpackageId)) {
                this.taskContext.logger.error(packageReuseError(unknownIdentifier));
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
                hidden: this.hideChildren,
                overviewPageId: undefined,
                availability: parentAvailability,
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

        // if the unknownIdentifier is not a subpackage, it could be an http endpoint, websocket, or webhook.
        return this.#convertEndpoint(
            {
                type: "endpoint",
                endpoint: unknownIdentifier,
                title: undefined,
                icon: undefined,
                slug: undefined,
                hidden: undefined,
                availability: undefined,
                playground: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined
            },
            apiDefinitionPackageId,
            parentSlug,
            parentAvailability
        );
    }

    #convertEndpoint(
        endpointItem: docsYml.ParsedApiReferenceLayoutItem.Endpoint,
        apiDefinitionPackageIdRaw: string | undefined,
        parentSlug: FernNavigation.V1.SlugGenerator,
        parentAvailability?: docsYml.RawSchemas.Availability
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
                this.taskContext.logger.debug(
                    `Expected Endpoint ID for ${endpoint.id} at path: ${stringifyEndpointPathPartsWithMethod(endpoint.method, endpoint.path.parts)}. Got undefined.`
                );
            } else {
                if (this.#visitedEndpoints.has(endpointId)) {
                    this.taskContext.logger.error(
                        `Duplicate endpoint found in the API Reference layout: ${endpointId}`
                    );
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
                    availability:
                        endpointItem.availability ??
                        FernNavigation.V1.convertAvailability(endpoint.availability) ??
                        parentAvailability,
                    isResponseStream: endpoint.response?.type.type === "stream",
                    title: endpointItem.title ?? endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
                    slug: endpointSlug.get(),
                    icon: this.resolveIconFileId(endpointItem.icon),
                    hidden: this.hideChildren || endpointItem.hidden,
                    playground: this.#convertPlaygroundSettings(endpointItem.playground),
                    authed: undefined,
                    viewers: endpointItem.viewers,
                    orphaned: endpointItem.orphaned,
                    featureFlags: endpointItem.featureFlags
                };
            }
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
                this.taskContext.logger.error(`Expected WebSocket ID for ${webSocket.id}. Got undefined.`);
            } else {
                if (this.#visitedWebSockets.has(webSocketId)) {
                    this.taskContext.logger.error(
                        `Duplicate web socket found in the API Reference layout: ${webSocketId}`
                    );
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
                    icon: this.resolveIconFileId(endpointItem.icon),
                    hidden: this.hideChildren || endpointItem.hidden,
                    apiDefinitionId: this.apiDefinitionId,
                    availability: FernNavigation.V1.convertAvailability(webSocket.availability) ?? parentAvailability,
                    playground: this.#convertPlaygroundSettings(endpointItem.playground),
                    authed: undefined,
                    viewers: endpointItem.viewers,
                    orphaned: endpointItem.orphaned,
                    featureFlags: endpointItem.featureFlags
                };
            }
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
                this.taskContext.logger.error(`Expected Webhook ID for ${webhook.id}. Got undefined.`);
            } else {
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
                    icon: this.resolveIconFileId(endpointItem.icon),
                    hidden: this.hideChildren || endpointItem.hidden,
                    apiDefinitionId: this.apiDefinitionId,
                    availability: parentAvailability,
                    authed: undefined,
                    viewers: endpointItem.viewers,
                    orphaned: endpointItem.orphaned,
                    featureFlags: endpointItem.featureFlags
                };
            }
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
            findEndpointById: (endpointId) => this.#holder.endpoints.get(endpointId),
            stringifyEndpointPathParts: (endpoint: APIV1Read.EndpointDefinition) =>
                stringifyEndpointPathParts(endpoint.path.parts),
            disableEndpointPairs: this.disableEndpointPairs,
            apiDefinitionId: this.apiDefinitionId
        });
    }

    #enrichApiPackageChild(
        child: FernNavigation.V1.ApiPackageChild,
        parentAvailability?: docsYml.RawSchemas.Availability
    ): FernNavigation.V1.ApiPackageChild {
        return enrichApiPackageChild({
            child,
            nodeIdToSubpackageId: this.#nodeIdToSubpackageId,
            convertApiDefinitionPackageId: (subpackageId, slug, childAvailability) =>
                this.#convertApiDefinitionPackageId(subpackageId, slug, childAvailability),
            mergeAndFilterChildren: this.#mergeAndFilterChildren.bind(this)
        });
    }

    #convertApiDefinitionPackage(
        pkg: APIV1Read.ApiDefinitionPackage,
        parentSlug: FernNavigation.V1.SlugGenerator,
        parentAvailability?: docsYml.RawSchemas.Availability
    ): FernNavigation.V1.ApiPackageChild[] {
        // if an endpoint, websocket, webhook, or subpackage is not visited, add it to the additional children list
        let additionalChildren: FernNavigation.V1.ApiPackageChild[] = [];

        pkg.endpoints.forEach((endpoint) => {
            if (endpoint.protocol?.type === "grpc") {
                const grpcId = this.#holder.getGrpcId(endpoint);
                if (grpcId == null) {
                    this.taskContext.logger.error(
                        `Expected Grpc ID for ${endpoint.id} at path: ${stringifyEndpointPathPartsWithMethod(endpoint.method, endpoint.path.parts)}. Got undefined.`
                    );
                    return;
                }
                if (this.#visitedGrpcs.has(grpcId)) {
                    return;
                }

                const grpcSlug = parentSlug.apply(endpoint);
                additionalChildren.push({
                    id: FernNavigation.V1.NodeId(`${this.apiDefinitionId}:${grpcId}`),
                    type: "grpc",
                    grpcId,
                    title: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
                    method: endpoint.protocol?.methodType ?? "UNARY",
                    apiDefinitionId: this.apiDefinitionId,
                    availability: parentAvailability,
                    slug: grpcSlug.get(),
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined
                });
            } else {
                const endpointId = this.#holder.getEndpointId(endpoint);
                if (endpointId == null) {
                    this.taskContext.logger.debug(
                        `Expected Endpoint ID for ${endpoint.id} at path: ${stringifyEndpointPathPartsWithMethod(endpoint.method, endpoint.path.parts)}. Got undefined.`
                    );
                    return;
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
                    availability: FernNavigation.V1.convertAvailability(endpoint.availability) ?? parentAvailability,
                    isResponseStream: endpoint.response?.type.type === "stream",
                    title: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
                    slug: endpointSlug.get(),
                    icon: undefined,
                    hidden: this.hideChildren,
                    playground: undefined,
                    authed: undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined
                });
            }
        });

        pkg.websockets.forEach((webSocket) => {
            const webSocketId = this.#holder.getWebSocketId(webSocket);
            if (webSocketId == null) {
                this.taskContext.logger.error(`Expected WebSocket ID for ${webSocket.id}. Got undefined.`);
                return;
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
                hidden: this.hideChildren,
                apiDefinitionId: this.apiDefinitionId,
                availability: FernNavigation.V1.convertAvailability(webSocket.availability) ?? parentAvailability,
                playground: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined
            });
        });

        pkg.webhooks.forEach((webhook) => {
            const webhookId = this.#holder.getWebhookId(webhook);
            if (webhookId == null) {
                this.taskContext.logger.error(`Expected Webhook ID for ${webhook.id}. Got undefined.`);
                return;
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
                hidden: this.hideChildren,
                apiDefinitionId: this.apiDefinitionId,
                availability: parentAvailability,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined
            });
        });

        pkg.subpackages.forEach((subpackageId) => {
            if (this.#visitedSubpackages.has(subpackageId)) {
                return;
            }

            const subpackage = this.#holder.getSubpackageByIdOrLocator(subpackageId);
            if (subpackage == null) {
                // I'm not clear on how this line is reachable.
                // If the pkg.subpackages are subpackageIds, and not locators, doesn't that imply they've already been
                // resolved to an existing subpackage?
                this.taskContext.logger.error(`Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`);
                return;
            }

            const slug = isSubpackage(subpackage) ? parentSlug.apply(subpackage) : parentSlug;
            const subpackageChildren = this.#convertApiDefinitionPackageId(subpackageId, slug, parentAvailability);
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
                    hidden: this.hideChildren,
                    overviewPageId: undefined,
                    availability: parentAvailability,
                    apiDefinitionId: this.apiDefinitionId,
                    pointsTo: undefined,
                    noindex: undefined,
                    playground: undefined,
                    authed: undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined
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
        parentSlug: FernNavigation.V1.SlugGenerator,
        parentAvailability?: docsYml.RawSchemas.Availability
    ): FernNavigation.V1.ApiPackageChild[] {
        const pkg =
            packageId != null
                ? this.#holder.resolveSubpackage(this.#holder.getSubpackageByIdOrLocator(packageId))
                : undefined;

        if (pkg == null) {
            this.taskContext.logger.debug(cannotFindSubpackageByLocatorError(packageId || "unknown", []));
            return [];
        }

        // if an endpoint, websocket, webhook, or subpackage is not visited, add it to the additional children list
        return this.#convertApiDefinitionPackage(pkg, parentSlug, parentAvailability);
    }

    #convertPlaygroundSettings(
        playgroundSettings?: docsYml.RawSchemas.PlaygroundSettings
    ): FernNavigation.V1.PlaygroundSettings | undefined {
        return convertPlaygroundSettings(playgroundSettings);
    }

    private mergeEndpointPairs(children: FernNavigation.V1.ApiPackageChild[]): FernNavigation.V1.ApiPackageChild[] {
        return mergeEndpointPairs({
            children,
            findEndpointById: (endpointId: APIV1Read.EndpointId) => this.#holder.endpoints.get(endpointId),
            stringifyEndpointPathParts: (endpoint: APIV1Read.EndpointDefinition) =>
                stringifyEndpointPathParts(endpoint.path.parts),
            disableEndpointPairs: this.disableEndpointPairs,
            apiDefinitionId: this.apiDefinitionId
        });
    }

    private getFileId(filepath: AbsoluteFilePath): string {
        const fileId = this.collectedFileIds.get(filepath);
        if (fileId == null) {
            return this.taskContext.failAndThrow("Failed to locate file after uploading: " + filepath);
        }
        return fileId;
    }

    private resolveIconFileId(
        iconPath: string | AbsoluteFilePath | undefined
    ): FernNavigation.V1.FileId | string | undefined {
        if (iconPath == null) {
            return undefined;
        }

        if (this.collectedFileIds.has(iconPath as AbsoluteFilePath)) {
            return `file:${this.getFileId(iconPath as AbsoluteFilePath)}` as FernNavigation.V1.FileId;
        }

        return iconPath as string;
    }
}
