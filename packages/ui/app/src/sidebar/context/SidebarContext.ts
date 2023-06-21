import React from "react";

export const SidebarContext = React.createContext<() => SidebarContextValue>(() => {
    throw new Error("SidebarContext.Provider not found in tree");
});

export interface SidebarContextValue {
    expandAllSections: boolean;
}
