import { createContext } from "react";
import { SidebarItemId } from "../ids/parseSidebarItemId";

export const SidebarContext = createContext<() => SidebarContextValue>(() => {
    throw new Error("SidebarContext not found in tree.");
});

export interface SidebarContextValue {
    states: Record<SidebarItemId, SidebarItemState>;
    setState: (itemId: SidebarItemId, state: SidebarItemState) => void;
}

export interface SidebarItemState {
    isCollapsed: boolean;
}
