import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Anchor, DocsContext, DocsContextValue } from "./DocsContext";
import { UrlPathResolverImpl } from "./url-path-resolver/UrlPathResolver";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({ docsDefinition, children }) => {
    const location = useLocation();
    const pathnameWithoutLeadingSlash = location.pathname.substring(1);
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

    const navigateToAnchorListeners = useRef<Record<StringifiedAnchor, (() => void)[]>>({});

    const registerNavigateToAnchorListener = useCallback(
        (hash: string, listener: () => void) => {
            const stringifiedAnchor = stringifyAnchor({ pathname: pathnameWithoutLeadingSlash, hash });
            const listenersForPath = (navigateToAnchorListeners.current[stringifiedAnchor] ??= []);
            listenersForPath.push(listener);
            return () => {
                const listeners = navigateToAnchorListeners.current[stringifiedAnchor];
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
        },
        [pathnameWithoutLeadingSlash]
    );

    const navigateToAnchor = useCallback((anchor: Anchor) => {
        const listeners = navigateToAnchorListeners.current[stringifyAnchor(anchor)];
        if (listeners != null) {
            for (const listener of listeners) {
                listener();
            }
        }
    }, []);

    const [anchorInView, setAnchorInView] = useState<Anchor>();

    const setAnchorInViewOnCurrentPage = useCallback(
        (hash: string) => {
            setAnchorInView({
                pathname: pathnameWithoutLeadingSlash,
                hash,
            });
        },
        [pathnameWithoutLeadingSlash]
    );

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

    useEffect(() => {
        const hash = location.hash.substring(1); // remove the leading #
        if (hash.length > 0) {
            const anchor: Anchor = {
                pathname: pathnameWithoutLeadingSlash,
                hash,
            };
            navigateToAnchor(anchor);
            setAnchorInView(anchor);
        }
        return () => {
            setAnchorInView(undefined);
        };
        // only run when page changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathnameWithoutLeadingSlash]);

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
            setAnchorInView: setAnchorInViewOnCurrentPage,
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
            setAnchorInViewOnCurrentPage,
        ]
    );

    return <DocsContext.Provider value={contextValue}>{children}</DocsContext.Provider>;
};

type StringifiedAnchor = string;

function stringifyAnchor(anchor: Anchor): string {
    return `${anchor.pathname}#${anchor.hash}`;
}
