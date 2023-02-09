import { failed, Loadable, loaded, loading, notStartedLoading } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Routes } from "../../routes";
import { REGISTRY_SERVICE } from "../../services/getRegistryService";
import { ApiContext, ApiContextValue, SidebarItemId } from "./ApiContext";

export const ApiContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [api, setApi] = useState<Loadable<FernRegistry.ApiDefinition>>(notStartedLoading());

    const { [Routes.API.parameters.API_ID]: apiId } = useParams();

    useEffect(() => {
        if (apiId == null) {
            setApi(notStartedLoading());
        } else {
            setApi(loading());
            REGISTRY_SERVICE.registry
                .getApiAtVersion(FernRegistry.ApiId(apiId), FernRegistry.ApiVersion("1.0"))
                .then((response) => {
                    if (response.ok) {
                        setApi(loaded(response.body));
                    } else {
                        setApi(failed(response.error));
                    }
                })
                .catch((error) => {
                    setApi(failed(error));
                });
        }
    }, [apiId]);

    const [visibleSidebarItems, setVisibleSidebarItems] = useState<SidebarItemId[]>([]);

    const setIsSidebarItemVisible = useCallback((sidebarItemid: SidebarItemId, isVisible: boolean) => {
        setVisibleSidebarItems((existing) => {
            const indexInList = existing.findIndex(
                (other) =>
                    other.serviceIndex === sidebarItemid.serviceIndex &&
                    other.endpointIndex === sidebarItemid.endpointIndex
            );
            if (isVisible && indexInList === -1) {
                return sidebarItemid.endpointIndex != null
                    ? [...existing, sidebarItemid]
                    : [sidebarItemid, ...existing];
            } else {
                return existing.filter((_other, otherIndex) => otherIndex !== indexInList);
            }
        });
    }, []);

    const contextValue = useCallback(
        (): ApiContextValue => ({
            api,
            focusedSidebarItem: visibleSidebarItems[0],
            setIsSidebarItemVisible,
        }),
        [api, setIsSidebarItemVisible, visibleSidebarItems]
    );

    return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>;
};
