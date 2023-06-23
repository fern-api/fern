import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useRouter } from "next/router";
import { PropsWithChildren, useCallback, useState } from "react";
import { ResolvedUrlPath } from "../ResolvedUrlPath";
import { DocsContext, DocsContextValue } from "./DocsContext";
import { useSlugListeners } from "./useSlugListeners";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
        resolvedUrlPath: ResolvedUrlPath;
        basePath: string | undefined;
        pathname: string;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({
    docsDefinition,
    basePath = "/",
    pathname,
    resolvedUrlPath,
    children,
}) => {
    const router = useRouter();

    const [selectedSlug, setSelectedSlug] = useState(resolvedUrlPath.slug);

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
            void router.push(slug);
            navigateToPathListeners.invokeListeners(slug);

            const timeout = setTimeout(() => {
                setJustNavigated(false);
            }, 500);
            return () => {
                clearTimeout(timeout);
            };
        },
        [navigateToPathListeners, router]
    );

    const scrollToPathListeners = useSlugListeners("scrollToPath", { selectedSlug });

    const onScrollToPath = useCallback(
        (slug: string) => {
            if (justNavigated || slug === selectedSlug) {
                return;
            }
            setSelectedSlug(slug);
            void router.push(slug, undefined, { shallow: true });
            scrollToPathListeners.invokeListeners(slug);
        },
        [justNavigated, router, scrollToPathListeners, selectedSlug]
    );

    const contextValue = useCallback(
        (): DocsContextValue => ({
            basePath,
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            registerNavigateToPathListener: navigateToPathListeners.registerListener,
            navigateToPath,
            onScrollToPath,
            registerScrolledToPathListener: scrollToPathListeners.registerListener,
            resolvedPathFromUrl: resolvedUrlPath,
            nextPath: undefined,
            previousPath: undefined,
            pathname,
            selectedSlug,
        }),
        [
            basePath,
            docsDefinition,
            navigateToPath,
            navigateToPathListeners.registerListener,
            onScrollToPath,
            pathname,
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
