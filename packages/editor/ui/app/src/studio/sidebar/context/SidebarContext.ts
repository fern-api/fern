import { createContext } from "react";

export const SidebarContext = createContext<() => SidebarContextValue>(() => {
    throw new Error("SidebarContext not found in tree.");
});

export interface SidebarContextValue {
    selectedItem: SidebarItemId | undefined;
    setSelectedItem: (itemId: SidebarItemId | undefined) => void;
    states: Record<SidebarItemId, SidebarItemState>;
    setState: (itemId: SidebarItemId, state: SidebarItemState) => void;
}

export type SidebarItemId = string;

export interface SidebarItemState {
    isCollapsed: boolean;
}
