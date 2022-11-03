import { TransactionGenerator } from "@fern-api/transaction-generator";
import React, { useCallback } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { DraftPackageSidebarItemId } from "../context/SidebarContext";
import { useSidebarContext } from "../context/useSidebarContext";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";
import { BasePackageSidebarItem } from "./BasePackageSidebarItem";

export declare namespace DraftPackageSidebarItem {
    export interface Props {
        draft: DraftPackageSidebarItemId;
        isRootPackage: boolean;
        children?: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const DraftPackageSidebarItem: React.FC<DraftPackageSidebarItem.Props> = ({
    draft,
    isRootPackage,
    children,
}) => {
    const { submitTransaction } = useApiEditorContext();
    const { setDraft } = useSidebarContext();

    const deleteDraft = useCallback(() => {
        setDraft(undefined);
    }, [setDraft]);

    const onRename = useCallback(
        (packageName: string) => {
            deleteDraft();
            submitTransaction(
                TransactionGenerator.createPackage({
                    packageId: draft.packageId,
                    parent: draft.parent,
                    packageName,
                })
            );
        },
        [deleteDraft, draft.packageId, draft.parent, submitTransaction]
    );

    return (
        <BasePackageSidebarItem
            packageId={draft.packageId}
            sidebarItemId={draft}
            packageName={undefined}
            isRootPackage={isRootPackage}
            onRename={onRename}
            onCancelRename={deleteDraft}
            onDelete={deleteDraft}
        >
            {children}
        </BasePackageSidebarItem>
    );
};
