import { assertNever } from "@fern-api/core-utils";
import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { UrlSlugTree } from "./UrlSlugTree";

export type ResolvedUrlPath = ResolvedPagePath | ResolvedTopLevelEndpointPath | ResolvedApiSubpackagePath;

export interface ResolvedPagePath {
    type: "page";
    pageId: FernRegistryDocsRead.PageId;
}

export interface ResolvedTopLevelEndpointPath {
    type: "top-level-endpoint";
    apiId: FernRegistry.ApiDefinitionId;
    endpoint: FernRegistryApiRead.EndpointDefinition;
}

export interface ResolvedApiSubpackagePath {
    type: "api-subpackage";
    apiId: FernRegistry.ApiDefinitionId;
    subpackageId: FernRegistryApiRead.SubpackageId;
}

export interface UrlPathResolver {
    // getUrlPathForSubpackage(subpackageId: FernRegistryApiRead.SubpackageId): string;
    // getUrlPathForEndpoint(subpackageId: FernRegistryApiRead.SubpackageId, endpointId: string): string;
    // getUrlPathForTopLevelEndpoint(endpointId: string): string;
    resolvePath(pathname: string): ResolvedUrlPath | undefined;
    // getHashForEndpoint(endpointId: string): string;
    // getHtmlIdForEndpoint(endpointId: string): string;
    // isTopLevelEndpointSelected(args: { endpointId: string; pathname: string; hash: string }): boolean;
    // isSubpackageEndpointSelected(args: {
    //     subpackageId: FernRegistryApiRead.SubpackageId;
    //     pathname: string;
    //     hash: string;
    // }): boolean;
    // isSubpackageSelected(args: {
    //     subpackageId: FernRegistryApiRead.SubpackageId;
    //     pathname: string;
    //     hash: string;
    // }): boolean;
    // isEndpointSelected(args: {
    //     subpackageId: FernRegistryApiRead.SubpackageId;
    //     endpointId: string;
    //     pathname: string;
    //     hash: string;
    // }): boolean;
    // stringifyPath: (resolvedPath: ResolvedUrlPath) => string;
}

export class UrlPathResolverImpl implements UrlPathResolver {
    private urlSlugTree: UrlSlugTree;

    constructor(docsDefinition: FernRegistryDocsRead.DocsDefinition) {
        this.urlSlugTree = new UrlSlugTree(docsDefinition);
    }

    public resolvePath(pathname: string): ResolvedUrlPath | undefined {
        const resolvedPath = this.urlSlugTree.resolveUrlPath(pathname);
        if (resolvedPath == null) {
            return undefined;
        }
        switch (resolvedPath.type) {
            case "page":
                return {
                    type: "page",
                    pageId: resolvedPath.page.id,
                };
            case "apiSubpackage":
                return {
                    type: "api-subpackage",
                    apiId: resolvedPath.apiId,
                    subpackageId: resolvedPath.subpackage.subpackageId,
                };
            case "topLevelEndpoint":
                return {
                    type: "top-level-endpoint",
                    apiId: resolvedPath.apiId,
                    endpoint: resolvedPath.endpoint,
                };
            case "section":
            case "apiSection":
                return undefined;
            default:
                assertNever(resolvedPath);
        }
    }
}
