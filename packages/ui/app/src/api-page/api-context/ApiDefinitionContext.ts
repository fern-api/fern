import { Loadable } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";
import React from "react";

export const ApiDefinitionContext = React.createContext<() => ApiDefinitionContextValue>(() => {
    throw new Error("ApiContextProvider is not present in this tree.");
});

export interface ApiDefinitionContextValue {
    api: Loadable<FernRegistry.ApiDefinition, FernRegistry.registry.getApiForEnvironment.Error>;
    resolveType: (typeId: FernRegistry.TypeId) => FernRegistry.Type;
    resolveSubpackage: (subpackageId: FernRegistry.SubpackageId) => FernRegistry.ApiDefinitionSubpackage;
}
