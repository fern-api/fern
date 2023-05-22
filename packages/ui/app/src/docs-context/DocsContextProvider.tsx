import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { DocsContext, DocsContextValue } from "./DocsContext";
import { UrlPathResolverImpl } from "./url-path-resolver/UrlPathResolver";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({ docsDefinition, children }) => {
    const urlPathResolver = useMemo(() => new UrlPathResolverImpl(docsDefinition), [docsDefinition]);

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

    const navigateToAnchorListeners = useRef<Record<string, (() => void)[]>>({});

    const registerNavigateToAnchorListener = useCallback((anchor: string, listener: () => void) => {
        const listenersForPath = (navigateToAnchorListeners.current[anchor] ??= []);
        listenersForPath.push(listener);
        return () => {
            const listeners = navigateToAnchorListeners.current[anchor];
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

    const navigateToAnchor = useCallback((anchor: string) => {
        const listeners = navigateToAnchorListeners.current[anchor];
        if (listeners != null) {
            for (const listener of listeners) {
                listener();
            }
        }
    }, []);

    const [anchorInView, setAnchorInView] = useState<string>();

    const scrollToTopListeners = useRef<(() => void)[]>([]);

    const registerScrollToTopListener = useCallback((listener: () => void) => {
        scrollToTopListeners.current.push(listener);
        return () => {
            const indexOfListenerToDelete = scrollToTopListeners.current.indexOf(listener);
            if (indexOfListenerToDelete !== -1) {
                // eslint-disable-next-line no-console
                console.warn("Failed to locate hash remove listener for deregistration.");
            } else {
                scrollToTopListeners.current.splice(indexOfListenerToDelete, 1);
            }
        };
    }, []);

    const scrollToTop = useCallback(() => {
        setAnchorInView(undefined);
        for (const listener of scrollToTopListeners.current) {
            listener();
        }
    }, []);

    const location = useLocation();
    useEffect(() => {
        const anchor = location.hash.substring(1); // remove the leading #
        if (anchor.length > 0) {
            navigateToAnchor(anchor);
            setAnchorInView(anchor);
        }
        // only run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const contextValue = useCallback(
        (): DocsContextValue => ({
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            urlPathResolver,
            registerNavigateToAnchorListener,
            navigateToAnchor,
            registerScrollToTopListener,
            scrollToTop,
            anchorInView,
            setAnchorInView,
        }),
        [
            resolveApi,
            resolvePage,
            resolveFile,
            docsDefinition,
            urlPathResolver,
            registerNavigateToAnchorListener,
            navigateToAnchor,
            registerScrollToTopListener,
            scrollToTop,
            anchorInView,
        ]
    );

    return <DocsContext.Provider value={contextValue}>{children}</DocsContext.Provider>;
};
