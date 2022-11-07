import { createContext } from "react";
import { DraftSidebarItemId } from "../drafts/DraftSidebarItemId";
import { SidebarItemId } from "../ids/SidebarItemId";
import { StringifiedSidebarItemId } from "../ids/StringifiedSidebarItemId";

export const SidebarContext = createContext<() => SidebarContextValue>(() => {
    throw new Error("SidebarContext not found in tree.");
});

export interface SidebarContextValue {
    states: Record<StringifiedSidebarItemId, SidebarItemState>;
    setState: (itemId: SidebarItemId, state: SidebarItemState) => void;
    draft: DraftSidebarItemId | undefined;
    setDraft: (itemId: DraftSidebarItemId | undefined) => void;
}

export interface SidebarItemState {
    isCollapsed: boolean;
}
