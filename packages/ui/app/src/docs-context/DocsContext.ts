import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import React from "react";
import { ResolvedUrlPath } from "../ResolvedUrlPath";

export const DocsContext = React.createContext<() => DocsContextValue>(() => {
    throw new Error("DocsContextValueProvider is not present in this tree.");
});

interface DocsInfoVersioned {
    type: "versioned";
    versions: string[];
    activeVersion: string;
    activeNavigationConfig: FernRegistryDocsRead.UnversionedNavigationConfig;
}

interface DocsInfoUnversioned {
    type: "unversioned";
    activeNavigationConfig: FernRegistryDocsRead.UnversionedNavigationConfig;
}

export type DocsInfo = DocsInfoVersioned | DocsInfoUnversioned;

export interface DocsContextValue {
    resolveApi: (apiId: FernRegistry.ApiDefinitionId) => FernRegistryApiRead.ApiDefinition;
    resolvePage: (pageId: FernRegistryDocsRead.PageId) => FernRegistryDocsRead.PageContent;
    resolveFile: (fileId: FernRegistryDocsRead.FileId) => FernRegistryDocsRead.Url;

    navigateToPath: (slug: string) => void;
    registerNavigateToPathListener: (slug: string, listener: () => void) => () => void;

    onScrollToPath: (slug: string) => void;
    registerScrolledToPathListener: (slug: string, listener: () => void) => () => void;

    docsDefinition: FernRegistryDocsRead.DocsDefinition;
    docsInfo: DocsInfo;

    // controlled
    selectedSlug: string | undefined;

    // from URL
    resolvedPathFromUrl: ResolvedUrlPath;

    nextPath: ResolvedUrlPath | undefined;
    previousPath: ResolvedUrlPath | undefined;
}

export interface Anchor {
    pathname: string;
    hash: string;
}
