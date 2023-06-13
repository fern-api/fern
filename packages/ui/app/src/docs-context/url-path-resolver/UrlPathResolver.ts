import { assertNever } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/serialization/resources/docs/resources/v1/resources/read";
import { UrlSlugTree, UrlSlugTreeNode } from "./UrlSlugTree";

export type ResolvedUrlPath =
    | ResolvedUrlPath.Section
    | ResolvedUrlPath.Page
    | ResolvedUrlPath.Api
    | ResolvedUrlPath.ClientLibraries
    | ResolvedUrlPath.TopLevelEndpoint
    | ResolvedUrlPath.ApiSubpackage
    | ResolvedUrlPath.Endpoint;

export declare namespace ResolvedUrlPath {
    export interface Section {
        type: "section";
        section: FernRegistryDocsRead.DocsSection.Raw;
        slug: string;
    }

    export interface Page {
        type: "page";
        page: FernRegistryDocsRead.PageMetadata.Raw;
        slug: string;
    }

    export interface Api {
        type: "api";
        apiSection: FernRegistryDocsRead.ApiSection.Raw;
        slug: string;
    }

    export interface ClientLibraries {
        type: "clientLibraries";
        apiSection: FernRegistryDocsRead.ApiSection.Raw;
        apiSlug: string;
        slug: string;
        artifacts: FernRegistryDocsRead.ApiArtifacts.Raw;
    }

    export interface TopLevelEndpoint {
        type: "topLevelEndpoint";
        apiSection: FernRegistryDocsRead.ApiSection.Raw;
        apiSlug: string;
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition.Raw;
    }

    export interface ApiSubpackage {
        type: "apiSubpackage";
        apiSection: FernRegistryDocsRead.ApiSection.Raw;
        apiSlug: string;
        slug: string;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage.Raw;
    }

    export interface Endpoint {
        type: "endpoint";
        apiSection: FernRegistryDocsRead.ApiSection.Raw;
        apiSlug: string;
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition.Raw;
        parent: FernRegistryApiRead.ApiDefinitionSubpackage.Raw;
    }
}

export class UrlPathResolverImpl {
    private urlSlugTree: UrlSlugTree;

    constructor(docsDefinition: FernRegistryDocsRead.DocsDefinition.Raw) {
        this.urlSlugTree = new UrlSlugTree(docsDefinition);
    }

    public resolveSlug(slug: string): ResolvedUrlPath | undefined {
        const node = this.urlSlugTree.resolveSlug(slug);
        if (node == null) {
            return undefined;
        }
        return this.convertNode(node);
    }

    public resolveSlugOrThrow(slug: string): ResolvedUrlPath {
        const path = this.resolveSlug(slug);
        if (path == null) {
            throw new Error("Failed to resolve slug: " + slug);
        }
        return path;
    }

    private convertNode(node: UrlSlugTreeNode): ResolvedUrlPath {
        switch (node.type) {
            case "section":
                return {
                    type: "section",
                    section: node.section,
                    slug: node.slug,
                };
            case "page":
                return {
                    type: "page",
                    page: node.page,
                    slug: node.slug,
                };
            case "api":
                return {
                    type: "api",
                    apiSection: node.apiSection,
                    slug: node.slug,
                };
            case "clientLibraries":
                return {
                    type: "clientLibraries",
                    apiSection: node.apiSection,
                    apiSlug: node.apiSlug,
                    slug: node.slug,
                    artifacts: node.artifacts,
                };
            case "topLevelEndpoint":
                return {
                    type: "topLevelEndpoint",
                    apiSection: node.apiSection,
                    apiSlug: node.apiSlug,
                    slug: node.slug,
                    endpoint: node.endpoint,
                };
            case "apiSubpackage":
                return {
                    type: "apiSubpackage",
                    apiSection: node.apiSection,
                    apiSlug: node.apiSlug,
                    slug: node.slug,
                    subpackage: node.subpackage,
                };
            case "endpoint":
                return {
                    type: "endpoint",
                    apiSection: node.apiSection,
                    apiSlug: node.apiSlug,
                    slug: node.slug,
                    parent: node.parent,
                    endpoint: node.endpoint,
                };
            default:
                assertNever(node);
        }
    }

    public getNextNavigatableItem(path: ResolvedUrlPath): ResolvedUrlPath | undefined {
        const { nextNavigatableItem } = this.urlSlugTree.getNeighbors(path.slug);
        return nextNavigatableItem != null ? this.convertNode(nextNavigatableItem) : undefined;
    }

    public getPreviousNavigatableItem(path: ResolvedUrlPath): ResolvedUrlPath | undefined {
        const { previousNavigatableItem } = this.urlSlugTree.getNeighbors(path.slug);
        return previousNavigatableItem != null ? this.convertNode(previousNavigatableItem) : undefined;
    }
}
