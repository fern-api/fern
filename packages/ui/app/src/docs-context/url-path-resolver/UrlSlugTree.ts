import { assertNever } from "@fern-api/core-utils";
import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { noop } from "lodash-es";

export class UrlSlugTree {
    private rootNodes: Record<UrlSlug, UrlSlugTreeNode>;

    constructor(private readonly docsDefinition: FernRegistryDocsRead.DocsDefinition) {
        this.rootNodes = this.constructSlugToNodeRecord(docsDefinition.config.navigation.items);
    }

    public resolveUrlPath(pathname: string): UrlSlugTreeNode | undefined {
        const slugs = pathname.split("/").map(decodeURIComponent);
        return this.resolveSlugsRecursive(slugs, this.rootNodes);
    }

    private resolveSlugsRecursive(
        slugs: string[],
        children: Record<UrlSlug, UrlSlugTreeNode>
    ): UrlSlugTreeNode | undefined {
        const [nextSlug, ...remainingSlugs] = slugs;
        if (nextSlug == null) {
            return undefined;
        }

        const child = children[nextSlug];
        if (child == null || remainingSlugs.length === 0) {
            return child;
        }

        switch (child.type) {
            case "apiSection":
            case "apiSubpackage":
            case "section":
                return this.resolveSlugsRecursive(remainingSlugs, child.children);
            case "page":
            case "topLevelEndpoint":
                return undefined;
            default:
                assertNever(child);
        }
    }

    private constructSlugToNodeRecord(items: FernRegistryDocsRead.NavigationItem[]): Record<UrlSlug, UrlSlugTreeNode> {
        return items.reduce<Record<UrlSlug, UrlSlugTreeNode>>((acc, item) => {
            item._visit({
                section: (section) => {
                    acc[section.urlSlug] = this.constructSectionNode(section);
                },
                page: (page) => {
                    acc[page.urlSlug] = this.constructPageNode(page);
                },
                api: (api) => {
                    acc[api.urlSlug] = this.constructApiNode(api);
                },
                _other: noop,
            });
            return acc;
        }, {});
    }

    private constructSectionNode(section: FernRegistryDocsRead.DocsSection): UrlSlugTreeNode.Section {
        return {
            type: "section",
            section,
            children: this.constructSlugToNodeRecord(section.items),
        };
    }

    private constructPageNode(page: FernRegistryDocsRead.PageMetadata): UrlSlugTreeNode.Page {
        return {
            type: "page",
            page,
        };
    }

    private constructApiNode(api: FernRegistryDocsRead.ApiSection): UrlSlugTreeNode.ApiSection {
        const apiDefinition = this.docsDefinition.apis[api.api];
        if (apiDefinition == null) {
            throw new Error("API definition does not exist: " + api.api);
        }
        return {
            type: "apiSection",
            api,
            children: {
                ...this.constructSlugToApiSubpackageRecord(apiDefinition, apiDefinition.rootPackage),
                ...apiDefinition.rootPackage.endpoints.reduce<Record<UrlSlug, UrlSlugTreeNode.TopLevelEndpoint>>(
                    (acc, topLevelEndpoint) => {
                        acc[topLevelEndpoint.urlSlug] = this.constructTopLevelEndpointNode(
                            apiDefinition,
                            topLevelEndpoint
                        );
                        return acc;
                    },
                    {}
                ),
            },
        };
    }

    private constructSlugToApiSubpackageRecord(
        apiDefinition: FernRegistryApiRead.ApiDefinition,
        package_: FernRegistryApiRead.ApiDefinitionPackage
    ): Record<UrlSlug, UrlSlugTreeNode.ApiSubpackage> {
        return package_.subpackages.reduce<Record<UrlSlug, UrlSlugTreeNode.ApiSubpackage>>((acc, subpackageId) => {
            const subpackage = apiDefinition.subpackages[subpackageId];
            if (subpackage == null) {
                throw new Error("Subpackage does not exist: " + subpackageId);
            }
            acc[subpackage.urlSlug] = this.constructApiSubpackageNode(apiDefinition, subpackage);
            return acc;
        }, {});
    }

    private constructTopLevelEndpointNode(
        apiDefinition: FernRegistryApiRead.ApiDefinition,
        topLevelEndpoint: FernRegistryApiRead.EndpointDefinition
    ): UrlSlugTreeNode.TopLevelEndpoint {
        return {
            type: "topLevelEndpoint",
            apiId: apiDefinition.id,
            endpoint: topLevelEndpoint,
        };
    }

    private constructApiSubpackageNode(
        apiDefinition: FernRegistryApiRead.ApiDefinition,
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage
    ): UrlSlugTreeNode.ApiSubpackage {
        return {
            type: "apiSubpackage",
            apiId: apiDefinition.id,
            subpackage,
            children: this.constructSlugToApiSubpackageRecord(apiDefinition, subpackage),
        };
    }
}

export type UrlSlug = string;

export type UrlSlugTreeNode =
    | UrlSlugTreeNode.Section
    | UrlSlugTreeNode.Page
    | UrlSlugTreeNode.ApiSection
    | UrlSlugTreeNode.TopLevelEndpoint
    | UrlSlugTreeNode.ApiSubpackage;

export declare namespace UrlSlugTreeNode {
    export interface Section {
        type: "section";
        section: FernRegistryDocsRead.DocsSection;
        children: Record<UrlSlug, UrlSlugTreeNode>;
    }

    export interface Page {
        type: "page";
        page: FernRegistryDocsRead.PageMetadata;
    }

    export interface ApiSection {
        type: "apiSection";
        api: FernRegistryDocsRead.ApiSection;
        children: Record<UrlSlug, TopLevelEndpoint | ApiSubpackage>;
    }

    export interface TopLevelEndpoint {
        type: "topLevelEndpoint";
        apiId: FernRegistry.ApiDefinitionId;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }

    export interface ApiSubpackage {
        type: "apiSubpackage";
        apiId: FernRegistry.ApiDefinitionId;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        children: Record<UrlSlug, ApiSubpackage>;
    }
}
