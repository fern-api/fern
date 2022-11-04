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

export type DraftSidebarItemId =
    | DraftPackageSidebarItemId
    | DraftEndpointSidebarItemId
    | DraftTypeSidebarItemId
    | DraftErrorSidebarItemId;

export interface DraftPackageSidebarItemId {
    type: "package";
    packageId: FernApiEditor.PackageId;
    parent: FernApiEditor.PackageId | undefined;
}

export interface DraftEndpointSidebarItemId {
    type: "endpoint";
    endpointId: FernApiEditor.EndpointId;
    parent: FernApiEditor.PackageId;
}

export interface DraftTypeSidebarItemId {
    type: "type";
    typeId: FernApiEditor.TypeId;
    parent: FernApiEditor.PackageId;
}

export interface DraftErrorSidebarItemId {
    type: "error";
    errorId: FernApiEditor.ErrorId;
    parent: FernApiEditor.PackageId;
}
