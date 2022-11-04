import { createContext } from "react";
import { DraftId, SidebarItemId } from "../ids/SidebarItemId";
import { StringifiedSidebarItemId } from "../ids/StringifiedSidebarItemId";

export const SidebarContext = createContext<() => SidebarContextValue>(() => {
    throw new Error("SidebarContext not found in tree.");
});

export interface SidebarContextValue {
    states: Record<StringifiedSidebarItemId, SidebarItemState>;
    setState: (itemId: SidebarItemId, state: SidebarItemState) => void;
    draft: DraftSidebarItemId | undefined;
    setDraft: (draft: DraftSidebarItemId | undefined) => void;
}

export interface SidebarItemState {
    isCollapsed: boolean;
}

export type DraftSidebarItemId = Extract<SidebarItemId, DraftId<unknown>>;
