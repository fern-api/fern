import { IconNames } from "@blueprintjs/icons";
import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { useSidebarContext, useSidebarItemState } from "../context/useSidebarContext";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../items/CollapsibleSidebarItemRow";
import { useEditableSidebarItem } from "../shared/useEditableSidebarItem";

export declare namespace PackageSidebarItem {
    export interface Props {
        package_: FernApiEditor.Package;
        parent: FernApiEditor.PackageId | undefined;
        children: CollapsibleSidebarItemRow.Props["children"];
    }
}

export const PackageSidebarItem: React.FC<PackageSidebarItem.Props> = ({ package_, parent, children }) => {
    const { onDelete, onRename, isDraft } = useEditableSidebarItem({
        definitionId: package_.packageId,
        parent,
        constructCreateTransaction,
        constructRenameTransaction,
        constructDeleteTransaction,
        isEqualToDraft,
    });

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.package(package_), [package_]);
    const isRootPackage = parent == null;

    const { setDraft } = useSidebarContext();
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

type ParentId = FernApiEditor.PackageId | undefined;

function constructCreateTransaction({
    name: packageName,
    parent,
    definitionId: packageId,
}: useEditableSidebarItem.constructCreateTransaction.Args<
    FernApiEditor.PackageId,
    ParentId
>): FernApiEditor.transactions.Transaction.CreatePackage {
    return TransactionGenerator.createPackage({
        packageId,
        packageName,
        parent,
    });
}

function constructRenameTransaction({
    newName: newPackageName,
    definitionId: packageId,
}: useEditableSidebarItem.constructRenameTransaction.Args<
    FernApiEditor.PackageId,
    ParentId
>): FernApiEditor.transactions.Transaction.RenamePackage {
    return TransactionGenerator.renamePackage({
        packageId,
        newPackageName,
    });
}

function constructDeleteTransaction({
    definitionId: packageId,
}: useEditableSidebarItem.constructDeleteTransaction.Args<
    FernApiEditor.PackageId,
    ParentId
>): FernApiEditor.transactions.Transaction.DeletePackage {
    return TransactionGenerator.deletePackage({
        packageId,
    });
}

function isEqualToDraft({
    definitionId: packageId,
    draft,
}: useEditableSidebarItem.isEqualToDraft.Args<FernApiEditor.PackageId, ParentId>): boolean {
    return draft.type === "package" && draft.packageId === packageId;
}
