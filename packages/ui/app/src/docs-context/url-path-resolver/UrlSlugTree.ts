import { assertNever } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { noop } from "lodash-es";
import { joinUrlSlugs } from "../joinUrlSlugs";

export class UrlSlugTree {
    private rootNodes: Record<UrlSlug, UrlSlugTreeNode>;

    constructor(private readonly docsDefinition: FernRegistryDocsRead.DocsDefinition) {
        this.rootNodes = this.constructSlugToNodeRecord({
            items: docsDefinition.config.navigation.items,
            parentSlug: "",
        });
    }

    public resolveUrlPath(pathname: string): UrlSlugTreeNode | undefined {
        const slugs = pathname.split("/").map(decodeURIComponent);
        return this.resolveSlugsRecursive({ slugs, children: this.rootNodes });
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
            item._visit({
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
            children: {
                ...this.constructSlugToApiSubpackageRecord({
                    apiDefinition,
                    apiSection,
                    package_: apiDefinition.rootPackage,
                    apiSlug: slug,
                    slugInsideApi: "",
                }),
                ...apiDefinition.rootPackage.endpoints.reduce<Record<UrlSlug, UrlSlugTreeNode.TopLevelEndpoint>>(
                    (acc, topLevelEndpoint) => {
                        acc[topLevelEndpoint.urlSlug] = this.constructTopLevelEndpointNode({
                            apiSection,
                            topLevelEndpoint,
                            apiSlug: slug,
                        });
                        return acc;
                    },
                    {}
                ),
            },
        };
    }

    private constructSlugToApiSubpackageRecord({
        apiDefinition,
        apiSection,
        package_,
        apiSlug,
        slugInsideApi,
    }: {
        apiDefinition: FernRegistryApiRead.ApiDefinition;
        apiSection: FernRegistryDocsRead.ApiSection;
        package_: FernRegistryApiRead.ApiDefinitionPackage;
        apiSlug: string;
        slugInsideApi: string;
    }): Record<UrlSlug, UrlSlugTreeNode.ApiSubpackage> {
        return package_.subpackages.reduce<Record<UrlSlug, UrlSlugTreeNode.ApiSubpackage>>((acc, subpackageId) => {
            const subpackage = apiDefinition.subpackages[subpackageId];
            if (subpackage == null) {
                throw new Error("Subpackage does not exist: " + subpackageId);
            }
            const resolvedSubpackage = resolveSubpackage(apiDefinition, subpackageId);
            acc[subpackage.urlSlug] = this.constructApiSubpackageNode({
                apiDefinition,
                apiSection,
                subpackage: resolvedSubpackage,
                apiSlug,
                slugInsideApi: joinUrlSlugs(slugInsideApi, subpackage.urlSlug),
            });
            return acc;
        }, {});
    }

    private constructTopLevelEndpointNode({
        apiSection,
        topLevelEndpoint,
        apiSlug,
    }: {
        apiSection: FernRegistryDocsRead.ApiSection;
        topLevelEndpoint: FernRegistryApiRead.EndpointDefinition;
        apiSlug: string;
    }): UrlSlugTreeNode.TopLevelEndpoint {
        return {
            type: "topLevelEndpoint",
            apiSection,
            apiSlug,
            endpoint: topLevelEndpoint,
        };
    }

    private constructApiSubpackageNode({
        apiDefinition,
        apiSection,
        subpackage,
        apiSlug,
        slugInsideApi,
    }: {
        apiDefinition: FernRegistryApiRead.ApiDefinition;
        apiSection: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        apiSlug: string;
        slugInsideApi: string;
    }): UrlSlugTreeNode.ApiSubpackage {
        return {
            type: "apiSubpackage",
            apiSection,
            apiSlug,
            slugInsideApi,
            subpackage,
            children: {
                ...this.constructSlugToApiSubpackageRecord({
                    apiDefinition,
                    apiSection,
                    package_: subpackage,
                    apiSlug,
                    slugInsideApi,
                }),
                ...this.constructSlugToEndpointRecord({
                    apiSection,
                    package_: subpackage,
                    apiSlug,
                    slugInsideApi,
                }),
            },
        };
    }

    private constructSlugToEndpointRecord({
        apiSection,
        package_,
        apiSlug,
        slugInsideApi,
    }: {
        apiSection: FernRegistryDocsRead.ApiSection;
        package_: FernRegistryApiRead.ApiDefinitionPackage;
        apiSlug: string;
        slugInsideApi: string;
    }): Record<UrlSlug, UrlSlugTreeNode.Endpoint> {
        return package_.endpoints.reduce<Record<UrlSlug, UrlSlugTreeNode.Endpoint>>((acc, endpoint) => {
            acc[endpoint.urlSlug] = this.constructEndpointNode({
                apiSection,
                apiSlug,
                slugInsideApi: joinUrlSlugs(slugInsideApi, endpoint.urlSlug),
                endpoint,
            });
            return acc;
        }, {});
    }

    private constructEndpointNode({
        apiSection,
        apiSlug,
        slugInsideApi,
        endpoint,
    }: {
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slugInsideApi: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }): UrlSlugTreeNode.Endpoint {
        return {
            type: "endpoint",
            apiSection,
            apiSlug,
            slugInsideApi,
            endpoint,
        };
    }
}

export type UrlSlug = string;

export type UrlSlugTreeNode =
    | UrlSlugTreeNode.Section
    | UrlSlugTreeNode.Page
    | UrlSlugTreeNode.Api
    | UrlSlugTreeNode.TopLevelEndpoint
    | UrlSlugTreeNode.ApiSubpackage
    | UrlSlugTreeNode.Endpoint;

export declare namespace UrlSlugTreeNode {
    export interface Section {
        type: "section";
        section: FernRegistryDocsRead.DocsSection;
        slug: string;
        children: Record<UrlSlug, UrlSlugTreeNode>;
    }

    export interface Page {
        type: "page";
        page: FernRegistryDocsRead.PageMetadata;
        slug: string;
    }

    export interface Api {
        type: "api";
        apiSection: FernRegistryDocsRead.ApiSection;
        slug: string;
        children: Record<UrlSlug, TopLevelEndpoint | ApiSubpackage>;
    }

    export interface TopLevelEndpoint {
        type: "topLevelEndpoint";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }

    export interface ApiSubpackage {
        type: "apiSubpackage";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slugInsideApi: string;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        children: Record<UrlSlug, ApiSubpackage | Endpoint>;
    }

    export interface Endpoint {
        type: "endpoint";
        apiSection: FernRegistryDocsRead.ApiSection;
        apiSlug: string;
        slugInsideApi: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

function resolveSubpackage(
    apiDefinition: FernRegistryApiRead.ApiDefinition,
    subpackageId: FernRegistryApiRead.SubpackageId
): FernRegistryApiRead.ApiDefinitionSubpackage {
    const subpackage = apiDefinition.subpackages[subpackageId];
    if (subpackage == null) {
        throw new Error("Subpackage does not exist: " + subpackageId);
    }
    if (subpackage.pointsTo != null) {
        return resolveSubpackage(apiDefinition, subpackage.pointsTo);
    } else {
        return subpackage;
    }
}
