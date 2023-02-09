import { Loadable } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";
import React from "react";

export const ApiContext = React.createContext<() => ApiContextValue>(() => {
    throw new Error("ApiContextProvider is not present in this tree.");
});

export interface ApiContextValue {
    api: Loadable<FernRegistry.ApiDefinition>;
    focusedSidebarItem: SidebarItemId | undefined;
    setIsSidebarItemVisible: (sidebarItemId: SidebarItemId, isVisible: boolean) => void;
}

export interface SidebarItemId {
    serviceIndex: number;
    // optional for services
    endpointIndex: number | undefined;
}
