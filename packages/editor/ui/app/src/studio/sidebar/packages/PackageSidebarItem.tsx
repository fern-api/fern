import { IconNames } from "@blueprintjs/icons";
import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { useSidebarContext, useSidebarItemState } from "../context/useSidebarContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";

export declare namespace PackageSidebarItem {
    export interface Props {
        package_: FernApiEditor.Package;
        parent: FernApiEditor.PackageId | undefined;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const PackageSidebarItem: React.FC<PackageSidebarItem.Props> = ({ package_, parent, children }) => {
    const { submitTransaction } = useApiEditorContext();

    const { draft, setDraft } = useSidebarContext();
    const isDraft = draft?.type === "package" && draft.packageId === package_.packageId;

    const deleteDraft = useCallback(() => {
        setDraft(undefined);
    }, [setDraft]);

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.package(package_), [package_]);
    const [, setSidebarItemState] = useSidebarItemState(sidebarItemId);

    const onClickAdd = useCallback(() => {
        setDraft({
            type: "package",
            parent: package_.packageId,
            packageId: EditorItemIdGenerator.package(),
        });
        setSidebarItemState({
            isCollapsed: false,
        });
    }, [package_.packageId, setDraft, setSidebarItemState]);

    const onRename = useCallback(
        (newPackageName: string) => {
            if (isDraft) {
                deleteDraft();
            }
            const transaction = isDraft
                ? TransactionGenerator.createPackage({
                      packageId: package_.packageId,
                      packageName: newPackageName,
                      parent,
                  })
                : TransactionGenerator.renamePackage({
                      packageId: package_.packageId,
                      newPackageName,
                  });
            submitTransaction(transaction);
        },
        [isDraft, package_.packageId, parent, submitTransaction, deleteDraft]
    );

    const onDelete = useCallback(() => {
        submitTransaction(
            TransactionGenerator.deletePackage({
                packageId: package_.packageId,
            })
        );
    }, [package_.packageId, submitTransaction]);

    const isRootPackage = parent == null;

    return (
        <CollapsibleSidebarItemRow
            itemId={sidebarItemId}
            label={package_.packageName}
            icon={IconNames.BOX}
            onClickAdd={onClickAdd}
            onRename={onRename}
            onDelete={onDelete}
            defaultIsCollapsed={!isRootPackage}
            isDraft={isDraft}
        >
            {children}
        </CollapsibleSidebarItemRow>
    );
};
