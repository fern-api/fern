import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { PropsWithChildren, useCallback, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DocsContext, DocsContextValue } from "./DocsContext";
import { ResolvedUrlPath, UrlPathResolverImpl } from "./url-path-resolver/UrlPathResolver";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({ docsDefinition, children }) => {
    const urlPathResolver = useMemo(() => new UrlPathResolverImpl(docsDefinition), [docsDefinition]);

    const location = useLocation();
    const resolvedPathFromUrl = useMemo(
        () => urlPathResolver.resolvePath(removeLeadingAndTrailingSlashes(location.pathname)),
        [location.pathname, urlPathResolver]
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

    const registerNavigateToPathListener = useCallback((path: ResolvedUrlPath, listener: () => void) => {
        const listenersForPath = (navigateToPathListeners.current[path.slug] ??= []);
        listenersForPath.push(listener);
        return () => {
            const listeners = navigateToPathListeners.current[path.slug];
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
    const navigateToPath = useCallback(
        (path: ResolvedUrlPath) => {
            setSelectedPath(path);
            navigate(path.slug);
            const listeners = navigateToPathListeners.current[path.slug];
            if (listeners != null) {
                for (const listener of listeners) {
                    setTimeout(listener, 0);
                }
            }
        },
        [navigate]
    );

    const [selectedPath, setSelectedPath] = useState(resolvedPathFromUrl);

    const setSelectedPathAndUpdateUrl = useCallback(
        (path: ResolvedUrlPath) => {
            setSelectedPath(path);
            navigate(path.slug);
        },
        [navigate]
    );

    const contextValue = useCallback(
        (): DocsContextValue => ({
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            resolvedPathFromUrl,
            registerNavigateToPathListener,
            navigateToPath,
            selectedPath,
            setSelectedPath: setSelectedPathAndUpdateUrl,
        }),
        [
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            resolvedPathFromUrl,
            registerNavigateToPathListener,
            navigateToPath,
            selectedPath,
            setSelectedPathAndUpdateUrl,
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
