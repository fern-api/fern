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
    draft: DraftSidebarItem | undefined;
    setDraft: (draft: DraftSidebarItem | undefined) => void;
}

export interface SidebarItemState {
    isCollapsed: boolean;
}

export type DraftSidebarItem =
    | DraftPackageSidebarItem
    | DraftEndpointSidebarItem
    | DraftTypeSidebarItem
    | DraftErrorSidebarItem;

export interface DraftPackageSidebarItem {
    type: "package";
    parent: FernApiEditor.PackageId | undefined;
}

export interface DraftEndpointSidebarItem {
    type: "endpoint";
    parent: FernApiEditor.PackageId;
}

export interface DraftTypeSidebarItem {
    type: "type";
    parent: FernApiEditor.PackageId;
}

export interface DraftErrorSidebarItem {
    type: "error";
    parent: FernApiEditor.PackageId;
}
