import { FernRegistry } from "@fern-fern/registry";
import React from "react";

export const ApiDefinitionItemContext = React.createContext<() => ApiDefinitionItemContextValue>(() => {
    throw new Error("ApiDefinitionItemContextProvider is not present in this tree.");
});

export interface ApiDefinitionItemContextValue {
    environmentId: FernRegistry.EnvironmentId;
}
