import React from "react";

export const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

export interface SidebarContextValue {
    depth: number;
}
