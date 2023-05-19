import React from "react";

export const SidebarContext = React.createContext<SidebarContextValue>({
    depth: 0,
});

export interface SidebarContextValue {
    depth: number;
}
