import { FernRegistry } from "@fern-fern/registry";
import React from "react";

export const ApiDefinitionSidebarContext = React.createContext<() => ApiDefinitionSidebarContextValue>(() => {
    throw new Error("ApiDefinitionSidebarContextProvider is not present in this tree.");
});

export interface ApiDefinitionSidebarContextValue {
    environmentId: FernRegistry.EnvironmentId;
}
