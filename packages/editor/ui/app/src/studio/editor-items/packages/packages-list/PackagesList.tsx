import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback } from "react";
import { DraftPackageSidebarItemId, DraftSidebarItemId } from "../../../sidebar/drafts/DraftSidebarItemId";
import { SidebarItemsList } from "../../shared/sidebar/SidebarItemsList";
import { PackageSidebarGroup } from "../package/sidebar/PackageSidebarGroup";

export declare namespace PackagesList {
    export interface Props {
        packages: readonly FernApiEditor.PackageId[];
        parent: FernApiEditor.PackageId | undefined;
    }
}

export const PackagesList: React.FC<PackagesList.Props> = ({ packages, parent }) => {
    const renderPackageSidebarGroup = useCallback(
        (packageId: FernApiEditor.PackageId) => (
            <PackageSidebarGroup key={packageId} packageId={packageId} parent={parent} />
        ),
        [parent]
    );

    const isDraftInParent = useCallback(
        (draft: DraftPackageSidebarItemId) => {
            return draft.parent === parent;
        },
        [parent]
    );

    return (
        <SidebarItemsList
            items={packages}
            renderItem={renderPackageSidebarGroup}
            convertDraftToItem={gePackageIdFromDraft}
            doesDraftBelongInList={isDraftInParent}
            parseDraftId={parsePackageDraft}
        />
    );
};

function parsePackageDraft(draft: DraftSidebarItemId): DraftPackageSidebarItemId | undefined {
    if (draft.type === "package") {
        return draft;
    }
    return undefined;
}

function gePackageIdFromDraft(draft: DraftPackageSidebarItemId): FernApiEditor.PackageId {
    return draft.packageId;
}
