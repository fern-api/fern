import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/serialization/resources/docs/resources/v1/resources/read";
import React from "react";
import { ResolvedUrlPath } from "./url-path-resolver/UrlPathResolver";

export const DocsContext = React.createContext<() => DocsContextValue>(() => {
    throw new Error("DocsContextValueProvider is not present in this tree.");
});

export interface DocsContextValue {
    resolveApi: (apiId: string) => FernRegistryApiRead.ApiDefinition.Raw;
    resolvePage: (pageId: FernRegistryDocsRead.PageId.Raw) => FernRegistryDocsRead.PageContent.Raw;
    resolveFile: (fileId: FernRegistryDocsRead.FileId.Raw) => FernRegistryDocsRead.Url.Raw;

    navigateToPath: (slug: string) => void;
    registerNavigateToPathListener: (slug: string, listener: () => void) => () => void;

    selectedPath: ResolvedUrlPath | undefined;
    onScrollToPath: (slug: string) => void;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;

    docsDefinition: FernRegistryDocsRead.DocsDefinition.Raw;
    basePath: string;
    resolvedPathFromUrl: ResolvedUrlPath | undefined;
    nextPath: ResolvedUrlPath | undefined;
    previousPath: ResolvedUrlPath | undefined;
}

export interface Anchor {
    pathname: string;
    hash: string;
}
