import React from "react";

export const ApiDefinitionSidebarContext = React.createContext<ApiDefinitionSidebarContextValue>({
    depth: 0,
});

export interface ApiDefinitionSidebarContextValue {
    depth: number;
}
