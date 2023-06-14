import React from "react";

export const SidebarDepthContext = React.createContext<SidebarDepthContextValue | undefined>(undefined);

export interface SidebarDepthContextValue {
    depth: number;
}
