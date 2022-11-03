import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createContext } from "react";
import {
    EndpointSidebarItemId,
    ErrorSidebarItemId,
    PackageSidebarItemId,
    SidebarItemId,
    TypeSidebarItemId,
} from "../ids/SidebarItemId";
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
    | DraftPackageSidebarItemId
    | DraftEndpointSidebarItemId
    | DraftTypeSidebarItemId
    | DraftErrorSidebarItemId;

export interface DraftPackageSidebarItemId extends PackageSidebarItemId {
    parent: FernApiEditor.PackageId | undefined;
}

export interface DraftEndpointSidebarItemId extends EndpointSidebarItemId {
    parent: FernApiEditor.PackageId;
}

export interface DraftTypeSidebarItemId extends TypeSidebarItemId {
    parent: FernApiEditor.PackageId;
}

export interface DraftErrorSidebarItemId extends ErrorSidebarItemId {
    parent: FernApiEditor.PackageId;
}
