import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { TypeId } from "@fern-fern/api-editor-sdk/resources";
import React, { useCallback } from "react";
import { DraftSidebarItemId, DraftTypeSidebarItemId } from "../context/SidebarContext";
import { SidebarItemsList } from "../shared/SidebarItemsList";
import { TypeSidebarItem } from "./TypeSidebarItem";
import { TypesSidebarItem } from "./TypesSidebarItem";

export declare namespace TypesSidebarGroup {
    export interface Props {
        package_: FernApiEditor.Package;
    }
}

export const TypesSidebarGroup: React.FC<TypesSidebarGroup.Props> = ({ package_ }) => {
    const renderTypeSidebarItem = useCallback(
        (typeId: TypeId) => <TypeSidebarItem key={typeId} typeId={typeId} parent={package_.packageId} />,
        [package_.packageId]
    );

    const isDraftInPackage = useCallback(
        (draft: DraftTypeSidebarItemId) => {
            return draft.parent === package_.packageId;
        },
        [package_.packageId]
    );

    return (
        <TypesSidebarItem package_={package_}>
            <SidebarItemsList
                items={package_.types}
                renderItem={renderTypeSidebarItem}
                convertDraftToItem={getTypeIdFromDraft}
                doesDraftBelongInList={isDraftInPackage}
                parseDraftId={parseTypeDraft}
            />
        </TypesSidebarItem>
    );
};

function parseTypeDraft(draft: DraftSidebarItemId): DraftTypeSidebarItemId | undefined {
    if (draft.type === "type") {
        return draft;
    }
    return undefined;
}

function getTypeIdFromDraft(draft: DraftTypeSidebarItemId): FernApiEditor.TypeId {
    return draft.typeId;
}
