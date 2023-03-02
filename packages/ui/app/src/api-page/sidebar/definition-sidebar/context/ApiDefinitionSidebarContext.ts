import React from "react";
import { ParsedEnvironmentId } from "../../../routes/useCurrentEnvironment";

export const ApiDefinitionSidebarContext = React.createContext<() => ApiDefinitionSidebarContextValue>(() => {
    throw new Error("ApiDefinitionSidebarContextProvider is not present in this tree.");
});

export interface ApiDefinitionSidebarContextValue {
    environmentId: ParsedEnvironmentId;
}
