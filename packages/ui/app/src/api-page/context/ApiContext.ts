import { Loadable } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";
import React from "react";

export const ApiContext = React.createContext<() => ApiContextValue>(() => {
    throw new Error("ApiContextProvider is not present in this tree.");
});

export interface ApiContextValue {
    api: Loadable<FernRegistry.ApiDefinition, FernRegistry.registry.getApiForEnvironment.Error>;
    resolveType: (typeId: FernRegistry.TypeId) => FernRegistry.Type;
}
