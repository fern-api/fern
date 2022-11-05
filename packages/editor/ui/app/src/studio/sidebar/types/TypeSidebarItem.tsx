import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { useType } from "../context/useType";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { EditableSidebarItemRow } from "../row/editable-row/EditableSidebarItemRow";
import { useEditableSidebarItem } from "../shared/useEditableSidebarItem";
import { TypeSidebarItemIcon } from "./TypeSidebarItemIcon";

export declare namespace TypeSidebarItem {
    export interface Props {
        typeId: FernApiEditor.TypeId;
        parent: FernApiEditor.PackageId;
    }
}

export const TypeSidebarItem: React.FC<TypeSidebarItem.Props> = ({ typeId, parent }) => {
    const type = useType(typeId);

    const { onDelete, onRename, isDraft } = useEditableSidebarItem({
        definitionId: typeId,
        parent,
        constructCreateTransaction,
        constructRenameTransaction,
        constructDeleteTransaction,
        isEqualToDraft,
    });

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.type(type), [type]);

    return (
        <EditableSidebarItemRow
            itemId={sidebarItemId}
            label={type.typeName}
            icon={<TypeSidebarItemIcon />}
            onDelete={onDelete}
            onRename={onRename}
            isDraft={isDraft}
            placeholder="Untitled type"
        />
    );
};

function constructCreateTransaction({
    name: typeName,
    parent,
    definitionId: typeId,
}: useEditableSidebarItem.constructCreateTransaction.Args<FernApiEditor.TypeId>): FernApiEditor.transactions.Transaction.CreateType {
    return TransactionGenerator.createType({
        typeId,
        typeName,
        parent,
    });
}

function constructRenameTransaction({
    newName: newTypeName,
    definitionId: typeId,
}: useEditableSidebarItem.constructRenameTransaction.Args<FernApiEditor.TypeId>): FernApiEditor.transactions.Transaction.RenameType {
    return TransactionGenerator.renameType({
        typeId,
        newTypeName,
    });
}

function constructDeleteTransaction({
    definitionId: typeId,
}: useEditableSidebarItem.constructDeleteTransaction.Args<FernApiEditor.TypeId>): FernApiEditor.transactions.Transaction.DeleteType {
    return TransactionGenerator.deleteType({
        typeId,
    });
}

function isEqualToDraft({
    definitionId: typeId,
    draft,
}: useEditableSidebarItem.isEqualToDraft.Args<FernApiEditor.TypeId>): boolean {
    return draft.type === "type" && draft.typeId === typeId;
}
