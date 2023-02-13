import { Loadable } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";
import * as FernRegistryCore from "@fern-fern/registry/core";
import React from "react";

export const ApiContext = React.createContext<() => ApiContextValue>(() => {
    throw new Error("ApiContextProvider is not present in this tree.");
});

export interface ApiContextValue {
    api: Loadable<
        FernRegistryCore.APIResponse<FernRegistry.ApiDefinition, FernRegistry.registry.getApiForEnvironment.Error>
    >;
    resolveType: (typeId: FernRegistry.TypeId) => FernRegistry.Type;
    focusedSidebarItem: SidebarItemId | undefined;
    setIsSidebarItemFocused: (sidebarItemId: SidebarItemId, isVisible: boolean) => void;
}

export type SidebarItemId = PackageId | EndpointId;

export interface PackageId {
    type: "package";
    packagePathIncludingSelf: PackagePath;
}

export interface EndpointId {
    type: "endpoint";
    packagePath: PackagePath;
    indexInParent: number;
}

export type PackagePath = readonly PackagePathItem[];

export interface PackagePathItem {
    indexInParent: number;
}
