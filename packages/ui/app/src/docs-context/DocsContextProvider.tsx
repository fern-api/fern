import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { PropsWithChildren, useCallback, useMemo, useRef } from "react";
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

    const sidebarItemClickListeners = useRef<Record<string, (() => void)[]>>({});

    const registerSidebarItemClickListener = useCallback((path: string, listener: () => void) => {
        const listenersForPath = (sidebarItemClickListeners.current[path] ??= []);
        listenersForPath.push(listener);
        return () => {
            const listeners = sidebarItemClickListeners.current[path];
            if (listeners != null) {
                const indexOfListenerToDelete = listeners.indexOf(listener);
                if (indexOfListenerToDelete !== -1) {
                    // eslint-disable-next-line no-console
                    console.warn("Failed to locate sidebar item click listener for deregistration.");
                } else {
                    listeners.splice(indexOfListenerToDelete, 1);
                }
            }
        };
    }, []);

    const onClickSidebarItem = useCallback((path: string) => {
        const listeners = sidebarItemClickListeners.current[path];
        if (listeners != null) {
            for (const listener of listeners) {
                listener();
            }
        }
    }, []);

    const contextValue = useCallback(
        (): DocsContextValue => ({
            resolveApi,
            docsDefinition,
            urlPathResolver,
            registerSidebarItemClickListener,
            onClickSidebarItem,
        }),
        [resolveApi, docsDefinition, onClickSidebarItem, registerSidebarItemClickListener, urlPathResolver]
    );

    return <DocsContext.Provider value={contextValue}>{children}</DocsContext.Provider>;
};
