import React from "react";
import { ParsedEnvironmentId } from "../../routes/useCurrentEnvironment";

export const ApiDefinitionItemContext = React.createContext<() => ApiDefinitionItemContextValue>(() => {
    throw new Error("ApiDefinitionItemContextProvider is not present in this tree.");
});

export interface ApiDefinitionItemContextValue {
    environmentId: ParsedEnvironmentId;
}
