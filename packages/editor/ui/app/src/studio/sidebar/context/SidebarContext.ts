import { createContext } from "react";
import { SidebarItemId } from "../ids/SidebarItemId";

export const SidebarContext = createContext<() => SidebarContextValue>(() => {
    throw new Error("SidebarContext not found in tree.");
});

export interface SidebarContextValue {
    selectedItem: SidebarItemId | undefined;
    setSelectedItem: (itemId: SidebarItemId | undefined) => void;
    states: Record<SidebarItemId, SidebarItemState>;
    setState: (itemId: SidebarItemId, state: SidebarItemState) => void;
}

export interface SidebarItemState {
    isCollapsed: boolean;
}
