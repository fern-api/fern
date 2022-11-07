import { MenuItemProps } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useMemo } from "react";
import { MaybeDraftPackage } from "../drafts/DraftableItem";
import { EndpointSidebarItemIcon } from "../endpoints/EndpointSidebarItemIcon";
import { useCreateEndpointCallback } from "../endpoints/useCreateEndpointCallback";
import { ErrorSidebarItemIcon } from "../errors/ErrorSidebarItemIcon";
import { useCreateErrorCallback } from "../errors/useCreateErrorCallback";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { CollapsibleSidebarItemRow } from "../row/collapsible/CollapsibleSidebarItemRow";
import { EditableSidebarItemRow } from "../row/editable-row/EditableSidebarItemRow";
import { useEditableSidebarItem } from "../shared/useEditableSidebarItem";
import { TypeSidebarItemIcon } from "../types/TypeSidebarItemIcon";
import { useCreateTypeCallback } from "../types/useCreateTypeCallback";

export declare namespace PackageSidebarItem {
    export interface Props {
        package_: MaybeDraftPackage;
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

    const onClickAddEndpoint = useCreateEndpointCallback({ package_ });
    const onClickAddType = useCreateTypeCallback({ package_ });
    const onClickAddError = useCreateErrorCallback({ package_ });
    const addMenuItems = useMemo(
        (): MenuItemProps[] => [
            { text: "Add endpoint", onClick: onClickAddEndpoint, icon: <EndpointSidebarItemIcon /> },
            { text: "Add type", onClick: onClickAddType, icon: <TypeSidebarItemIcon /> },
            { text: "Add error", onClick: onClickAddError, icon: <ErrorSidebarItemIcon /> },
        ],
        [onClickAddEndpoint, onClickAddError, onClickAddType]
    );

    const renderRow = useCallback(
        ({ leftElement }: { leftElement: JSX.Element }) => {
            return (
                <EditableSidebarItemRow
                    itemId={sidebarItemId}
                    leftElement={leftElement}
                    label={package_.isDraft ? "" : package_.packageName}
                    icon={IconNames.BOX}
                    onClickAdd={addMenuItems}
                    onRename={onRename}
                    onDelete={onDelete}
                    isDraft={isDraft}
                    placeholder="Untitled package"
                />
            );
        },
        [addMenuItems, isDraft, onDelete, onRename, package_, sidebarItemId]
    );

    return (
        <CollapsibleSidebarItemRow itemId={sidebarItemId} defaultIsCollapsed={!isRootPackage} renderRow={renderRow}>
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
