import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import React from "react";
import { ResolvedUrlPath } from "./url-path-resolver/UrlPathResolver";

export const DocsContext = React.createContext<() => DocsContextValue>(() => {
    throw new Error("DocsContextValueProvider is not present in this tree.");
});

export interface DocsContextValue {
    resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
    resolvePage: (pageId: FernRegistryDocsRead.PageId) => FernRegistryDocsRead.PageContent;
    resolveFile: (fileId: FernRegistryDocsRead.FileId) => FernRegistryDocsRead.Url;

    navigateToPath: (slug: string) => void;
    registerNavigateToPathListener: (slug: string, listener: () => void) => () => void;

    selectedPath: ResolvedUrlPath | undefined;
    onScrollToPath: (slug: string) => void;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;

    docsDefinition: FernRegistryDocsRead.DocsDefinition;
    pathname: string;
    basePath: string;
    resolvedPathFromUrl: ResolvedUrlPath | undefined;
    nextPath: ResolvedUrlPath | undefined;
    previousPath: ResolvedUrlPath | undefined;
}

export interface Anchor {
    pathname: string;
    hash: string;
}
