import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { PropsWithChildren, useCallback, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DocsContext, DocsContextValue } from "./DocsContext";
import { UrlPathResolverImpl } from "./url-path-resolver/UrlPathResolver";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({ docsDefinition, children }) => {
    const urlPathResolver = useMemo(() => new UrlPathResolverImpl(docsDefinition), [docsDefinition]);

    const location = useLocation();
    const resolvedPathFromUrl = useMemo(
        () => urlPathResolver.resolveSlug(removeLeadingAndTrailingSlashes(location.pathname)),
        [location.pathname, urlPathResolver]
    );

    const nextPath = useMemo(
        () => (resolvedPathFromUrl != null ? urlPathResolver.getNextNavigatableItem(resolvedPathFromUrl) : undefined),
        [resolvedPathFromUrl, urlPathResolver]
    );

    const previousPath = useMemo(
        () =>
            resolvedPathFromUrl != null ? urlPathResolver.getPreviousNavigatableItem(resolvedPathFromUrl) : undefined,
        [resolvedPathFromUrl, urlPathResolver]
    );

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

    const navigateToPathListeners = useRef<Record<string, (() => void)[]>>({});

    const registerNavigateToPathListener = useCallback((slug: string, listener: () => void) => {
        const listenersForPath = (navigateToPathListeners.current[slug] ??= []);
        listenersForPath.push(listener);
        return () => {
            const listeners = navigateToPathListeners.current[slug];
            if (listeners != null) {
                const indexOfListenerToDelete = listeners.indexOf(listener);
                if (indexOfListenerToDelete !== -1) {
                    // eslint-disable-next-line no-console
                    console.warn("Failed to hash change listener for deregistration.");
                } else {
                    listeners.splice(indexOfListenerToDelete, 1);
                }
            }
        };
    }, []);

    const navigate = useNavigate();
    const [justNavigated, setJustNavigated] = useState(false);
    const navigateToPath = useCallback(
        (slug: string) => {
            const path = urlPathResolver.resolveSlugOrThrow(slug);
            setJustNavigated(true);
            setSelectedPath(path);
            navigate(path.slug);
            const listeners = navigateToPathListeners.current[path.slug];
            if (listeners != null) {
                for (const listener of listeners) {
                    setTimeout(listener, 0);
                }
            }

            const timeout = setTimeout(() => {
                setJustNavigated(false);
            }, 500);
            return () => {
                clearTimeout(timeout);
            };
        },
        [navigate, urlPathResolver]
    );

    const [selectedPath, setSelectedPath] = useState(resolvedPathFromUrl);

    const setSelectedPathAndUpdateUrl = useCallback(
        (slug: string) => {
            if (!justNavigated) {
                const path = urlPathResolver.resolveSlugOrThrow(slug);
                setSelectedPath(path);
                navigate(slug, { replace: true });
            }
        },
        [justNavigated, navigate, urlPathResolver]
    );

    const contextValue = useCallback(
        (): DocsContextValue => ({
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            registerNavigateToPathListener,
            navigateToPath,
            selectedPath,
            setSelectedPath: setSelectedPathAndUpdateUrl,
            resolvedPathFromUrl,
            nextPath,
            previousPath,
        }),
        [
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            registerNavigateToPathListener,
            navigateToPath,
            selectedPath,
            setSelectedPathAndUpdateUrl,
            resolvedPathFromUrl,
            nextPath,
            previousPath,
        ]
    );

    return <DocsContext.Provider value={contextValue}>{children}</DocsContext.Provider>;
};

function removeLeadingAndTrailingSlashes(s: string): string {
    if (s.startsWith("/")) {
        s = s.substring(1);
    }
    if (s.endsWith("/")) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}
