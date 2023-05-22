import { assertNever } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { UrlSlugTree } from "./UrlSlugTree";

export type ResolvedUrlPath =
    | ResolvedUrlPath.Section
    | ResolvedUrlPath.Page
    | ResolvedUrlPath.Api
    | ResolvedUrlPath.TopLevelEndpoint
    | ResolvedUrlPath.ApiSubpackage
    | ResolvedUrlPath.Endpoint;

export declare namespace ResolvedUrlPath {
    export interface Section {
        type: "section";
        section: FernRegistryDocsRead.DocsSection;
        slug: string;
    }

    export interface Page {
        type: "page";
        page: FernRegistryDocsRead.PageMetadata;
        slug: string;
    }

    export interface Api {
        type: "api";
        api: FernRegistryDocsRead.ApiSection;
        slug: string;
    }

    export interface TopLevelEndpoint {
        type: "topLevelEndpoint";
        api: FernRegistryDocsRead.ApiSection;
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }

    export interface ApiSubpackage {
        type: "apiSubpackage";
        api: FernRegistryDocsRead.ApiSection;
        slug: string;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
    }

    export interface Endpoint {
        type: "endpoint";
        api: FernRegistryDocsRead.ApiSection;
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export interface UrlPathResolver {
    resolvePath(pathname: string): ResolvedUrlPath | undefined;
}

export class UrlPathResolverImpl implements UrlPathResolver {
    private urlSlugTree: UrlSlugTree;

    constructor(docsDefinition: FernRegistryDocsRead.DocsDefinition) {
        this.urlSlugTree = new UrlSlugTree(docsDefinition);
    }

    public resolvePath(pathname: string): ResolvedUrlPath | undefined {
        const node = this.urlSlugTree.resolveUrlPath(pathname);
        if (node == null) {
            return undefined;
        }
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
                    api: node.apiSection,
                    slug: node.slug,
                };
            case "topLevelEndpoint":
                return {
                    type: "topLevelEndpoint",
                    api: node.apiSection,
                    slug: this.urlSlugTree.joinUrlSlugs(node.apiSlug, node.endpoint.urlSlug),
                    endpoint: node.endpoint,
                };
            case "apiSubpackage":
                return {
                    type: "apiSubpackage",
                    api: node.apiSection,
                    slug: this.urlSlugTree.joinUrlSlugs(node.apiSlug, node.slugInsideApi),
                    subpackage: node.subpackage,
                };
            case "endpoint":
                return {
                    type: "endpoint",
                    api: node.apiSection,
                    slug: this.urlSlugTree.joinUrlSlugs(node.apiSlug, node.slugInsideApi),
                    endpoint: node.endpoint,
                };
            default:
                assertNever(node);
        }
    }
}
