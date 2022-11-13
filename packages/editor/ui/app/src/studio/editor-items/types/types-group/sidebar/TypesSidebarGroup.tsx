import { EMPTY_ARRAY } from "@fern-api/core-utils";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { TypeId } from "@fern-fern/api-editor-sdk/resources";
import React, { useCallback } from "react";
import { MaybeDraftPackage } from "../../../../sidebar/drafts/DraftableItem";
import { DraftSidebarItemId, DraftTypeSidebarItemId } from "../../../../sidebar/drafts/DraftSidebarItemId";
import { SidebarItemsList } from "../../../shared/sidebar/SidebarItemsList";
import { TypeSidebarItem } from "../../type/sidebar/TypeSidebarItem";
import { TypesSidebarItem } from "./TypesSidebarItem";

export declare namespace TypesSidebarGroup {
    export interface Props {
        package_: MaybeDraftPackage;
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
                items={package_.isDraft ? EMPTY_ARRAY : package_.types}
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
