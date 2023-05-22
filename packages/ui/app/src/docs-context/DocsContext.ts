import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import React from "react";
import { UrlPathResolver } from "./url-path-resolver/UrlPathResolver";

export const DocsContext = React.createContext<() => DocsContextValue>(() => {
    throw new Error("DocsContextValueProvider is not present in this tree.");
});

export interface DocsContextValue {
    resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
    resolvePage: (pageId: FernRegistryDocsRead.PageId) => FernRegistryDocsRead.PageContent;
    resolveFile: (fileId: FernRegistryDocsRead.FileId) => FernRegistryDocsRead.Url;

    navigateToAnchor: (anchor: Anchor) => void;
    registerNavigateToAnchorListener: (hash: string, listener: () => void) => () => void;
    scrollToTop: () => void;
    registerScrollToTopListener: (listener: () => void) => () => void;
    anchorInView: Anchor | undefined;
    setAnchorInView: (hash: string) => void;

    docsDefinition: FernRegistryDocsRead.DocsDefinition;
    urlPathResolver: UrlPathResolver;
}

export interface Anchor {
    pathname: string;
    hash: string;
}
