import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createContext } from "react";
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

export type DraftSidebarItemId = SidebarItemId & {
    parent: FernApiEditor.PackageId | undefined;
};
