import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import React from "react";
import { ResolvedUrlPath, UrlPathResolver } from "./url-path-resolver/UrlPathResolver";

export const DocsContext = React.createContext<() => DocsContextValue>(() => {
    throw new Error("DocsContextValueProvider is not present in this tree.");
});

export interface DocsContextValue {
    resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
    resolvePage: (pageId: FernRegistryDocsRead.PageId) => FernRegistryDocsRead.PageContent;
    resolveFile: (fileId: FernRegistryDocsRead.FileId) => FernRegistryDocsRead.Url;

    navigateToPath: (path: ResolvedUrlPath) => void;
    registerNavigateToPathListener: (path: ResolvedUrlPath, listener: () => void) => () => void;

    setPathInView: (path: ResolvedUrlPath) => void;
    isPathInView: (path: ResolvedUrlPath) => boolean;

    docsDefinition: FernRegistryDocsRead.DocsDefinition;
    urlPathResolver: UrlPathResolver;
}

export interface Anchor {
    pathname: string;
    hash: string;
}
