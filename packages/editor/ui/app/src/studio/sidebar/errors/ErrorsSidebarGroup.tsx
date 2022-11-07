import { EMPTY_ARRAY } from "@fern-api/core-utils";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { ErrorId } from "@fern-fern/api-editor-sdk/resources";
import React, { useCallback } from "react";
import { MaybeDraftPackage } from "../drafts/DraftableItem";
import { DraftErrorSidebarItemId, DraftSidebarItemId } from "../drafts/DraftSidebarItemId";
import { SidebarItemsList } from "../shared/SidebarItemsList";
import { ErrorSidebarItem } from "./ErrorSidebarItem";
import { ErrorsSidebarItem } from "./ErrorsSidebarItem";

export declare namespace ErrorsSidebarGroup {
    export interface Props {
        package_: MaybeDraftPackage;
    }
}

export const ErrorsSidebarGroup: React.FC<ErrorsSidebarGroup.Props> = ({ package_ }) => {
    const renderErrorSidebarItem = useCallback(
        (errorId: ErrorId) => <ErrorSidebarItem key={errorId} errorId={errorId} parent={package_.packageId} />,
        [package_.packageId]
    );

    const isDraftInPackage = useCallback(
        (draft: DraftErrorSidebarItemId) => {
            return draft.parent === package_.packageId;
        },
        [package_.packageId]
    );

    return (
        <ErrorsSidebarItem package_={package_}>
            <SidebarItemsList<FernApiEditor.ErrorId, DraftErrorSidebarItemId>
                items={package_.isDraft ? EMPTY_ARRAY : package_.errors}
                renderItem={renderErrorSidebarItem}
                convertDraftToItem={getErrorIdFromDraft}
                doesDraftBelongInList={isDraftInPackage}
                parseDraftId={parseErrorDraft}
            />
        </ErrorsSidebarItem>
    );
};

function parseErrorDraft(draft: DraftSidebarItemId): DraftErrorSidebarItemId | undefined {
    if (draft.type === "error") {
        return draft;
    }
    return undefined;
}

function getErrorIdFromDraft(draft: DraftErrorSidebarItemId): FernApiEditor.ErrorId {
    return draft.errorId;
}
