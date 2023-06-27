import { assertNever, noop, visitDiscriminatedUnion } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export class UrlSlugTree {
    private root: Record<UrlSlug, UrlSlugTreeNode>;
    private nodeToNeighbors: Record<UrlSlug, UrlSlugNeighbors> = {};

    constructor(private readonly docsDefinition: FernRegistryDocsRead.DocsDefinition) {
        this.root = this.constructSlugToNodeRecord({
            items: docsDefinition.config.navigation.items,
            parentSlug: "",
        });

        const nodesInOrder = this.inOrderTraverse(Object.values(this.root));
        let indexOfPreviousNavigatableItem = -1,
            indexOfPreviousPreviousNavigatableItem = -1,
            indexOfNextNavigatableItem = getIndexOfFirstNavigatableItem(nodesInOrder, { startingAt: 0 });
        for (const [index, node] of nodesInOrder.entries()) {
            const newIndexOfNextNavigatableItem =
                index === indexOfNextNavigatableItem
                    ? getIndexOfFirstNavigatableItem(nodesInOrder, { startingAt: index + 1 })
                    : indexOfNextNavigatableItem;

            let previousNavigatableItem = nodesInOrder[indexOfPreviousNavigatableItem];
            const nextNavigatableItem = nodesInOrder[newIndexOfNextNavigatableItem];

            const apiSlug = getApiSlug(node);
            if (apiSlug != null && previousNavigatableItem != null) {
                const apiSlugOfPrevious = getApiSlug(previousNavigatableItem);
                if (apiSlugOfPrevious === apiSlug) {
                    previousNavigatableItem = nodesInOrder[indexOfPreviousPreviousNavigatableItem];
                }
            }

            this.nodeToNeighbors[node.slug] = {
                previousNavigatableItem,
                nextNavigatableItem,
            };

            if (newIndexOfNextNavigatableItem > indexOfNextNavigatableItem) {
                indexOfPreviousPreviousNavigatableItem = indexOfPreviousNavigatableItem;
                indexOfPreviousNavigatableItem = index;
                indexOfNextNavigatableItem = newIndexOfNextNavigatableItem;
            }
        }
    }

    public resolveSlug(slug: string): UrlSlugTreeNode | undefined {
        const slugParts = slug.split("/").map(decodeURIComponent);
        return this.resolveSlugsRecursive({ slugs: slugParts, children: this.root });
    }

    public getNeighbors(slug: UrlSlug): UrlSlugNeighbors {
        const neighbors = this.nodeToNeighbors[slug];
        if (neighbors == null) {
            throw new Error("URL slug does not exist: " + slug);
        }
        return neighbors;
    }

    private resolveSlugsRecursive({
        slugs,
        children,
    }: {
        slugs: string[];
        children: Record<UrlSlug, UrlSlugTreeNode>;
    }): UrlSlugTreeNode | undefined {
        const [nextSlug, ...remainingSlugs] = slugs;
        if (nextSlug == null) {
            return undefined;
        }

        const child = children[nextSlug];
        if (child == null || remainingSlugs.length === 0) {
            return child;
        }

        switch (child.type) {
            case "api":
            case "apiSubpackage":
            case "section":
                return this.resolveSlugsRecursive({ slugs: remainingSlugs, children: child.children });
            case "clientLibraries":
            case "page":
            case "topLevelEndpoint":
            case "endpoint":
                return undefined;
            default:
                assertNever(child);
        }
    }

    private constructSlugToNodeRecord({
        items,
        parentSlug,
    }: {
        items: FernRegistryDocsRead.NavigationItem[];
        parentSlug: string;
    }): Record<UrlSlug, UrlSlugTreeNode> {
        return items.reduce<Record<UrlSlug, UrlSlugTreeNode>>((acc, item) => {
            visitDiscriminatedUnion(item, "type")._visit({
                section: (section) => {
                    acc[section.urlSlug] = this.constructSectionNode({
                        section,
                        slug: joinUrlSlugs(parentSlug, section.urlSlug),
                    });
                },
                page: (page) => {
                    acc[page.urlSlug] = this.constructPageNode({
                        page,
                        slug: joinUrlSlugs(parentSlug, page.urlSlug),
                    });
                },
                api: (api) => {
                    acc[api.urlSlug] = this.constructApiNode({
                        apiSection: api,
                        slug: joinUrlSlugs(parentSlug, api.urlSlug),
                    });
                },
                _other: noop,
            });
            return acc;
        }, {});
    }

    private constructSectionNode({
        section,
        slug,
    }: {
        section: FernRegistryDocsRead.DocsSection;
        slug: string;
    }): UrlSlugTreeNode.Section {
        return {
            type: "section",
            section,
            slug,
            children: this.constructSlugToNodeRecord({ items: section.items, parentSlug: slug }),
        };
    }

    private constructPageNode({
        page,
        slug,
    }: {
        page: FernRegistryDocsRead.PageMetadata;
        slug: string;
    }): UrlSlugTreeNode.Page {
        return {
            type: "page",
            page,
            slug,
        };
    }

    private constructApiNode({
        apiSection,
        slug,
    }: {
        apiSection: FernRegistryDocsRead.ApiSection;
        slug: string;
    }): UrlSlugTreeNode.Api {
        const apiDefinition = this.docsDefinition.apis[apiSection.api];
        if (apiDefinition == null) {
            throw new Error("API definition does not exist: " + apiSection.api);
        }

        return {
            type: "api",
            apiSection,
            slug,
            apiSlug: slug,
            children: this.constructApiChildren({
                apiSection,
                slug,
                apiDefinition,
            }),
        };
    }

    private constructApiChildren({
        apiSection,
        slug,
        apiDefinition,
    }: {
        apiSection: FernRegistryDocsRead.ApiSection;
        slug: string;
        apiDefinition: FernRegistryApiRead.ApiDefinition;
    }): UrlSlugTreeNode.Api["children"] {
        const children: UrlSlugTreeNode.Api["children"] = {};

        if (apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts)) {
            children["client-libraries"] = {
                type: "clientLibraries",
                apiSlug: slug,
                apiSection,
                slug: joinUrlSlugs(slug, "client-libraries"),
                artifacts: apiSection.artifacts,
            };
        }

        Object.assign(children, {
            ...apiDefinition.rootPackage.endpoints.reduce<Record<UrlSlug, UrlSlugTreeNode.TopLevelEndpoint>>(
                (acc, topLevelEndpoint, index) => {
                    acc[topLevelEndpoint.urlSlug] = this.constructTopLevelEndpointNode({
                        apiSection,
                        topLevelEndpoint,
                        apiSlug: slug,
                        isFirstItemInApi: index === 0,
                    });
                    return acc;
                },
                {}
            ),
            ...this.constructSlugToApiSubpackageRecord({
                apiDefinition,
                apiSection,
                package_: apiDefinition.rootPackage,
                apiSlug: slug,
                slugInsideApi: "",
                isFirstItemInApi: apiDefinition.rootPackage.endpoints.length === 0,
            }),
        });

        return children;
    }

    private constructSlugToApiSubpackageRecord({
        apiDefinition,
        apiSection,
        package_,
        apiSlug,
        slugInsideApi,
        isFirstItemInApi,
    }: {
        apiDefinition: FernRegistryApiRead.ApiDefinition;
        apiSection: FernRegistryDocsRead.ApiSection;
        package_: FernRegistryApiRead.ApiDefinitionPackage;
        apiSlug: string;
        slugInsideApi: string;
        isFirstItemInApi: boolean;
    }): Record<UrlSlug, UrlSlugTreeNode.ApiSubpackage> {
        return package_.subpackages.reduce<Record<UrlSlug, UrlSlugTreeNode.ApiSubpackage>>((acc, subpackageId) => {
            const subpackage = apiDefinition.subpackages[subpackageId];
            if (subpackage == null) {
                throw new Error("Subpackage does not exist: " + subpackageId);
            }
            if (doesSubpackageHaveEndpointsRecursive(subpackageId, (id) => resolveSubpackage(apiDefinition, id))) {
                const resolvedSubpackage = resolveSubpackage(apiDefinition, subpackageId);
                acc[subpackage.urlSlug] = this.constructApiSubpackageNode({
                    apiDefinition,
                    apiSection,
                    subpackage: resolvedSubpackage,
                    apiSlug,
                    slugInsideApi: joinUrlSlugs(slugInsideApi, subpackage.urlSlug),
                    isFirstItemInApi: isFirstItemInApi && Object.keys(acc).length === 0,
                });
            }
            return acc;
        }, {});
    }

    private constructTopLevelEndpointNode({
        apiSection,
        topLevelEndpoint,
        isFirstItemInApi,
        apiSlug,
    }: {
        apiSection: FernRegistryDocsRead.ApiSection;
        topLevelEndpoint: FernRegistryApiRead.EndpointDefinition;
        isFirstItemInApi: boolean;
        apiSlug: string;
    }): UrlSlugTreeNode.TopLevelEndpoint {
        return {
            type: "topLevelEndpoint",
            apiSection,
            apiSlug,
            slug: joinUrlSlugs(apiSlug, topLevelEndpoint.urlSlug),
            endpoint: topLevelEndpoint,
            isFirstItemInApi,
        };
    }

    private constructApiSubpackageNode({
        apiDefinition,
        apiSection,
        subpackage,
        apiSlug,
        slugInsideApi,
        isFirstItemInApi,
    }: {
        apiDefinition: FernRegistryApiRead.ApiDefinition;
        apiSection: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        apiSlug: string;
        slugInsideApi: string;
        isFirstItemInApi: boolean;
    }): UrlSlugTreeNode.ApiSubpackage {
        return {
            type: "apiSubpackage",
            apiSection,
            apiSlug,
            slug: joinUrlSlugs(apiSlug, slugInsideApi),
            subpackage,
            isFirstItemInApi,
            children: {
                ...this.constructSlugToApiSubpackageRecord({
                    apiDefinition,
                    apiSection,
                    package_: subpackage,
                    apiSlug,
                    slugInsideApi,
                    isFirstItemInApi: false,
                }),
                ...this.constructSlugToEndpointRecord({
                    apiSection,
                    subpackage,
                    apiSlug,
                    slugInsideApi,
                }),
            },
        };
    }

    private constructSlugToEndpointRecord({
        apiSection,
        subpackage,
        apiSlug,
        slugInsideApi,
    }: {
        apiSection: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        apiSlug: string;
        slugInsideApi: string;
    }): Record<UrlSlug, UrlSlugTreeNode.Endpoint> {
        return subpackage.endpoints.reduce<Record<UrlSlug, UrlSlugTreeNode.Endpoint>>((acc, endpoint) => {
            acc[endpoint.urlSlug] = this.constructEndpointNode({
                apiSection,
                apiSlug,
                slugInsideApi: joinUrlSlugs(slugInsideApi, endpoint.urlSlug),
                parent: subpackage,
                endpoint,
            });
            return acc;
        }, {});
    }

    private constructEndpointNode({
        apiSection,
        apiSlug,
        slugInsideApi,
        parent,
        endpoint,
    }: {
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slugInsideApi: string;
        parent: FernRegistryApiRead.ApiDefinitionSubpackage;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }): UrlSlugTreeNode.Endpoint {
        return {
            type: "endpoint",
            apiSection,
            apiSlug,
            slug: joinUrlSlugs(apiSlug, slugInsideApi),
            parent,
            endpoint,
        };
    }

    private inOrderTraverse(nodes: UrlSlugTreeNode[]): UrlSlugTreeNode[] {
        const inOrder: UrlSlugTreeNode[] = [];

        for (const node of nodes) {
            inOrder.push(node);
            switch (node.type) {
                case "section":
                case "api":
                case "apiSubpackage":
                    inOrder.push(...this.inOrderTraverse(Object.values(node.children)));
                    break;
                case "clientLibraries":
                case "page":
                case "topLevelEndpoint":
                case "endpoint":
                    break;
                default:
                    assertNever(node);
            }
        }

        return inOrder;
    }
}

export type UrlSlug = string;

export type UrlSlugTreeNode =
    | UrlSlugTreeNode.Section
    | UrlSlugTreeNode.Page
    | UrlSlugTreeNode.Api
    | UrlSlugTreeNode.ClientLibraries
    | UrlSlugTreeNode.TopLevelEndpoint
    | UrlSlugTreeNode.ApiSubpackage
    | UrlSlugTreeNode.Endpoint;

export declare namespace UrlSlugTreeNode {
    export interface Section extends BaseNode {
        type: "section";
        section: FernRegistryDocsRead.DocsSection;
        children: Record<UrlSlug, UrlSlugTreeNode>;
    }

    export interface Page extends BaseNode {
        type: "page";
        page: FernRegistryDocsRead.PageMetadata;
    }

    export interface Api extends BaseNode, BaseApiNode {
        type: "api";
        children: Record<UrlSlug, ClientLibraries | TopLevelEndpoint | ApiSubpackage>;
    }

    export interface ClientLibraries extends BaseNode, BaseApiNode {
        type: "clientLibraries";
        artifacts: FernRegistryDocsRead.ApiArtifacts;
    }

    export interface TopLevelEndpoint extends BaseNode, BaseApiNode {
        type: "topLevelEndpoint";
        endpoint: FernRegistryApiRead.EndpointDefinition;
        isFirstItemInApi: boolean;
    }

    export interface ApiSubpackage extends BaseNode, BaseApiNode {
        type: "apiSubpackage";
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        isFirstItemInApi: boolean;
        children: Record<UrlSlug, ApiSubpackage | Endpoint>;
    }

    export interface Endpoint extends BaseNode, BaseApiNode {
        type: "endpoint";
        endpoint: FernRegistryApiRead.EndpointDefinition;
        parent: FernRegistryApiRead.ApiDefinitionSubpackage;
    }

    export interface BaseNode {
        slug: string;
    }

    export interface BaseApiNode {
        apiSlug: string;
        apiSection: FernRegistryDocsRead.ApiSection;
    }
}

export interface UrlSlugNeighbors {
    previousNavigatableItem: UrlSlugTreeNode | undefined;
    nextNavigatableItem: UrlSlugTreeNode | undefined;
}

function getIndexOfFirstNavigatableItem(nodes: UrlSlugTreeNode[], { startingAt }: { startingAt: number }): number {
    for (const [i, node] of nodes.slice(startingAt).entries()) {
        switch (node.type) {
            case "page":
                return startingAt + i;
            case "clientLibraries":
                return startingAt + i;
            case "topLevelEndpoint":
            case "apiSubpackage":
                if (node.isFirstItemInApi) {
                    return startingAt + i;
                }
                break;
            case "api":
            case "endpoint":
            case "section":
                break;
            default:
                assertNever(node);
        }
    }
    return nodes.length;
}

function getApiSlug(node: UrlSlugTreeNode): string | undefined {
    switch (node.type) {
        case "api":
        case "clientLibraries":
        case "endpoint":
        case "apiSubpackage":
        case "topLevelEndpoint":
            return node.apiSlug;
        case "section":
        case "page":
            return undefined;
        default:
            assertNever(node);
    }
}

function areApiArtifactsNonEmpty(apiArtifacts: FernRegistryDocsRead.ApiArtifacts): boolean {
    return apiArtifacts.sdks.length > 0 || apiArtifacts.postman != null;
}

function joinUrlSlugs(...parts: [string, ...string[]]): string {
    return parts.reduce((a, b) => {
        if (a === "") {
            return b;
        }
        return `${a}/${b}`;
    });
}

function resolveSubpackage(
    apiDefinition: FernRegistryApiRead.ApiDefinition,
    subpackageId: FernRegistryApiRead.SubpackageId
): FernRegistryApiRead.ApiDefinitionSubpackage {
    const subpackage = apiDefinition.subpackages[subpackageId];
    if (subpackage == null) {
        throw new Error("Subpackage does not exist");
    }
    if (subpackage.pointsTo != null) {
        const resolvedSubpackage = resolveSubpackage(apiDefinition, subpackage.pointsTo);
        return {
            ...resolvedSubpackage,
            name: subpackage.name,
            urlSlug: subpackage.urlSlug,
        };
    } else {
        return subpackage;
    }
}

function doesSubpackageHaveEndpointsRecursive(
    subpackageId: FernRegistryApiRead.SubpackageId,
    resolveSubpackage: (subpackageId: FernRegistryApiRead.SubpackageId) => FernRegistryApiRead.ApiDefinitionSubpackage
): boolean {
    const subpackage = resolveSubpackage(subpackageId);
    if (subpackage.endpoints.length > 0) {
        return true;
    }
    return subpackage.subpackages.some((s) => doesSubpackageHaveEndpointsRecursive(s, resolveSubpackage));
}
