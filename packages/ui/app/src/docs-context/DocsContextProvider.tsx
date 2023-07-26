import { assertNever } from "@fern-api/core-utils";
import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { ResolvedUrlPath } from "../ResolvedUrlPath";
import { DocsContext, DocsContextValue, type DocsInfo } from "./DocsContext";
import { useSlugListeners } from "./useSlugListeners";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        docsInfo: DocsInfo;
        resolvedUrlPath: ResolvedUrlPath;
        nextPath: ResolvedUrlPath | undefined;
        previousPath: ResolvedUrlPath | undefined;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({
    docsDefinition,
    docsInfo,
    resolvedUrlPath,
    nextPath,
    previousPath,
    children,
}) => {
    const router = useRouter();

    const selectedSlugFromUrl = useMemo(() => {
        switch (resolvedUrlPath.type) {
            case "clientLibraries":
            case "endpoint":
            case "markdown-page":
            case "mdx-page":
            case "topLevelEndpoint":
            case "apiSubpackage":
                return docsInfo.rootSlug + "/" + resolvedUrlPath.slug;
            case "api":
            case "section":
                return undefined;
            default:
                assertNever(resolvedUrlPath);
        }
    }, [docsInfo.rootSlug, resolvedUrlPath]);
    const [selectedSlug, setSelectedSlug] = useState(selectedSlugFromUrl);
    useEffect(() => {
        if (selectedSlug == null) {
            setSelectedSlug(selectedSlugFromUrl);
        }
    }, [selectedSlug, selectedSlugFromUrl]);

    const resolveApi = useCallback(
        (apiId: FernRegistry.ApiDefinitionId): FernRegistryApiRead.ApiDefinition => {
            const api = docsDefinition.apis[apiId];
            if (api == null) {
                throw new Error("API does not exist: " + apiId);
            }
            return api;
        },
        [docsDefinition.apis]
    );

    const resolvePage = useCallback(
        (pageId: FernRegistryDocsRead.PageId): FernRegistryDocsRead.PageContent => {
            const page = docsDefinition.pages[pageId];
            if (page == null) {
                throw new Error("Page does not exist: " + pageId);
            }
            return page;
        },
        [docsDefinition.pages]
    );

    const resolveFile = useCallback(
        (fileId: FernRegistryDocsRead.FileId): FernRegistryDocsRead.Url => {
            const file = docsDefinition.files[fileId];
            if (file == null) {
                throw new Error("File does not exist: " + fileId);
            }
            return file;
        },
        [docsDefinition.files]
    );

    const navigateToPathListeners = useSlugListeners("navigateToPath", { selectedSlug });

    const [justNavigated, setJustNavigated] = useState(false);
    const navigateToPath = useCallback(
        (slug: string) => {
            setJustNavigated(true);
            setSelectedSlug(slug);
            navigateToPathListeners.invokeListeners(slug);

            const timeout = setTimeout(() => {
                setJustNavigated(false);
            }, 500);
            return () => {
                clearTimeout(timeout);
            };
        },
        [navigateToPathListeners]
    );

    const scrollToPathListeners = useSlugListeners("scrollToPath", { selectedSlug });

    const onScrollToPath = useCallback(
        (slug: string) => {
            if (justNavigated || slug === selectedSlug) {
                return;
            }
            const slugWithPrefix = `${docsInfo.rootSlug}/${slug}`;
            setSelectedSlug(slugWithPrefix);
            void router.push(`/${slugWithPrefix}`, undefined, { shallow: true });
            scrollToPathListeners.invokeListeners(slug);
        },
        [justNavigated, docsInfo.rootSlug, router, scrollToPathListeners, selectedSlug]
    );

    const contextValue = useCallback(
        (): DocsContextValue => ({
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            docsInfo,
            registerNavigateToPathListener: navigateToPathListeners.registerListener,
            navigateToPath,
            onScrollToPath,
            registerScrolledToPathListener: scrollToPathListeners.registerListener,
            resolvedPathFromUrl: resolvedUrlPath,
            nextPath,
            previousPath,
            selectedSlug,
        }),
        [
            docsDefinition,
            docsInfo,
            navigateToPath,
            navigateToPathListeners.registerListener,
            nextPath,
            onScrollToPath,
            previousPath,
            resolveApi,
            resolveFile,
            resolvePage,
            resolvedUrlPath,
            scrollToPathListeners.registerListener,
            selectedSlug,
        ]
    );

    return <DocsContext.Provider value={contextValue}>{children}</DocsContext.Provider>;
};
