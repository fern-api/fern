import { assertNever, entries } from "@fern-api/core-utils";
import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export type ResolvedUrlPath = ResolvedTopLevelEndpointPath | ResolvedSubpackagePath;

export interface ResolvedPagePath {
    type: "page";
    pageId: FernRegistryDocsRead.PageId;
}

export interface ResolvedTopLevelEndpointPath {
    type: "top-level-endpoint";
    apiId: FernRegistry.ApiDefinitionId;
    endpoint: FernRegistryApiRead.EndpointDefinition;
}

export interface ResolvedSubpackagePath {
    type: "subpackage";
    apiId: FernRegistry.ApiDefinitionId;
    subpackageId: FernRegistryApiRead.SubpackageId;
    endpointId: string | undefined;
}

export interface UrlPathResolver {
    getUrlPathForSubpackage(subpackageId: FernRegistryApiRead.SubpackageId): string;
    getUrlPathForEndpoint(subpackageId: FernRegistryApiRead.SubpackageId, endpointId: string): string;
    getUrlPathForTopLevelEndpoint(endpointId: string): string;
    resolvePath(args: { pathname: string; hash: string }): ResolvedUrlPath | undefined;
    getHashForEndpoint(endpointId: string): string;
    getHtmlIdForEndpoint(endpointId: string): string;
    isTopLevelEndpointSelected(args: { endpointId: string; pathname: string; hash: string }): boolean;
    isSubpackageEndpointSelected(args: {
        subpackageId: FernRegistryApiRead.SubpackageId;
        pathname: string;
        hash: string;
    }): boolean;
    isSubpackageSelected(args: {
        subpackageId: FernRegistryApiRead.SubpackageId;
        pathname: string;
        hash: string;
    }): boolean;
    isEndpointSelected(args: {
        subpackageId: FernRegistryApiRead.SubpackageId;
        endpointId: string;
        pathname: string;
        hash: string;
    }): boolean;
    stringifyPath: (resolvedPath: ResolvedUrlPath) => string;
}

const HASH_PREFIX_REGEX = /^#/;

interface SubpackageWithId {
    subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
    subpackageId: FernRegistryApiRead.SubpackageId;
}
export class UrlPathResolverImpl implements UrlPathResolver {
    private apiDefinition: FernRegistryApiRead.ApiDefinition;
    private subpackageIdToParentId: Record<FernRegistryApiRead.SubpackageId, FernRegistryApiRead.SubpackageId> = {};

    constructor(apiDefinition: FernRegistryApiRead.ApiDefinition) {
        this.apiDefinition = apiDefinition;

        for (const [parentId, parent] of entries(apiDefinition.subpackages)) {
            for (const childId of parent.subpackages) {
                this.subpackageIdToParentId[childId] = parentId;
            }
        }
    }

    public getUrlPathForSubpackage(subpackageId: FernRegistryApiRead.SubpackageId): string {
        const parts: string[] = [];

        let childId: FernRegistryApiRead.SubpackageId | undefined = subpackageId;
        while (childId != null) {
            const child = this.apiDefinition.subpackages[childId];
            if (child == null) {
                throw new Error("Subpackage does not exist: " + childId);
            }
            parts.unshift(child.name);
            childId = this.subpackageIdToParentId[childId];
        }

        return parts.join("/");
    }

    public getUrlPathForEndpoint(subpackageId: FernRegistryApiRead.SubpackageId, endpointId: string): string {
        return `${this.getUrlPathForSubpackage(subpackageId)}${this.getHashForEndpoint(endpointId)}`;
    }

    public getUrlPathForTopLevelEndpoint(endpointId: string): string {
        return endpointId;
    }

    public resolvePath({ pathname, hash }: { pathname: string; hash: string }): ResolvedUrlPath | undefined {
        const parts = pathname.split("/").filter((part) => part.length > 0);

        const [firstPart, ...remainingParts] = parts;
        if (firstPart == null) {
            return undefined;
        }

        if (remainingParts.length === 0) {
            const endpoint = this.apiDefinition.rootPackage.endpoints.find((endpoint) => endpoint.id === firstPart);
            if (endpoint != null) {
                return {
                    type: "top-level-endpoint",
                    endpoint,
                };
            }
        }

        const subpackage = this.resolveSubpackage(this.apiDefinition.rootPackage, parts);
        if (subpackage == null) {
            return undefined;
        }

        const hashWithoutPoundSign = hash.replace(HASH_PREFIX_REGEX, "");

        return {
            type: "subpackage",
            subpackageId: subpackage.subpackageId,
            endpointId: hashWithoutPoundSign.length > 0 ? hashWithoutPoundSign : undefined,
        };
    }

    public isTopLevelEndpointSelected({
        endpointId,
        pathname,
        hash,
    }: {
        endpointId: string;
        pathname: string;
        hash: string;
    }): boolean {
        const resolvedPath = this.resolvePath({
            pathname,
            hash,
        });
        return resolvedPath?.type === "top-level-endpoint" && resolvedPath.endpoint.id === endpointId;
    }

    public isSubpackageSelected({
        subpackageId,
        pathname,
        hash,
    }: {
        subpackageId: FernRegistryApiRead.SubpackageId;
        pathname: string;
        hash: string;
    }): boolean {
        const resolvedPath = this.resolvePath({ pathname, hash });
        return (
            resolvedPath?.type === "subpackage" &&
            resolvedPath.subpackageId === subpackageId &&
            resolvedPath.endpointId == null
        );
    }

    public isSubpackageEndpointSelected({
        subpackageId,
        pathname,
        hash,
    }: {
        subpackageId: FernRegistryApiRead.SubpackageId;
        pathname: string;
        hash: string;
    }): boolean {
        const resolvedPath = this.resolvePath({
            pathname,
            hash,
        });
        return (
            resolvedPath?.type === "subpackage" &&
            resolvedPath.subpackageId === subpackageId &&
            resolvedPath.endpointId != null
        );
    }

    public isEndpointSelected({
        subpackageId,
        endpointId,
        pathname,
        hash,
    }: {
        subpackageId: FernRegistryApiRead.SubpackageId;
        endpointId: string;
        pathname: string;
        hash: string;
    }): boolean {
        const resolvedPath = this.resolvePath({ pathname, hash });
        return (
            resolvedPath?.type === "subpackage" &&
            resolvedPath.subpackageId === subpackageId &&
            hash === this.getHashForEndpoint(endpointId)
        );
    }

    public getHashForEndpoint(endpointId: string): string {
        return `#${this.getHtmlIdForEndpoint(endpointId)}`;
    }

    public getHtmlIdForEndpoint(endpointId: string): string {
        return endpointId;
    }

    public stringifyPath(resolvedPath: ResolvedUrlPath): string {
        switch (resolvedPath.type) {
            case "top-level-endpoint":
                return this.getUrlPathForTopLevelEndpoint(resolvedPath.endpoint.id);
            case "subpackage": {
                let path = this.getUrlPathForSubpackage(resolvedPath.subpackageId);
                if (resolvedPath.endpointId != null) {
                    path += this.getHashForEndpoint(resolvedPath.endpointId);
                }
                return path;
            }
            default:
                assertNever(resolvedPath);
        }
    }

    private resolveSubpackage(
        parent: FernRegistryApiRead.ApiDefinitionPackage,
        subpackageNamePath: string[]
    ): SubpackageWithId | undefined {
        const [nextSubpackageName, ...remainingSubpackageNames] = subpackageNamePath;
        if (nextSubpackageName == null) {
            return undefined;
        }

        const nextSubpackage = this.getSubpackageByName(parent, nextSubpackageName);

        if (nextSubpackage == null || remainingSubpackageNames.length === 0) {
            return nextSubpackage;
        }

        return this.resolveSubpackage(nextSubpackage.subpackage, remainingSubpackageNames);
    }

    private getSubpackageByName(
        parent: FernRegistryApiRead.ApiDefinitionPackage,
        subpackageName: string
    ): SubpackageWithId | undefined {
        for (const subpackageId of parent.subpackages) {
            const subpackage = this.apiDefinition.subpackages[subpackageId];
            if (subpackage?.name === subpackageName) {
                return {
                    subpackage,
                    subpackageId,
                };
            }
        }
        return undefined;
    }
}
