import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useEditableSidebarItemCallbacks } from "../../../shared/useEditableSidebarItemCallbacks";

export declare namespace useEditTypeCallbacks {
    export interface Args {
        typeId: FernApiEditor.TypeId;
        parent: FernApiEditor.PackageId;
    }
}

export function useEditTypeCallbacks({
    typeId,
    parent,
}: useEditTypeCallbacks.Args): useEditableSidebarItemCallbacks.Return {
    return useEditableSidebarItemCallbacks({
        definitionId: typeId,
        parent,
        constructCreateTransaction,
        constructRenameTransaction,
        constructDeleteTransaction,
        isEqualToDraft,
    });
}

function constructCreateTransaction({
    name: typeName,
    parent,
    definitionId: typeId,
}: useEditableSidebarItemCallbacks.constructCreateTransaction.Args<FernApiEditor.TypeId>): FernApiEditor.transactions.Transaction.CreateType {
    return TransactionGenerator.createType({
        typeId,
        typeName,
        parent,
        shape: FernApiEditor.Shape.object({
            properties: [],
        }),
    });
}

function constructRenameTransaction({
    newName: newTypeName,
    definitionId: typeId,
}: useEditableSidebarItemCallbacks.constructRenameTransaction.Args<FernApiEditor.TypeId>): FernApiEditor.transactions.Transaction.RenameType {
    return TransactionGenerator.renameType({
        typeId,
        newTypeName,
    });
}

function constructDeleteTransaction({
    definitionId: typeId,
}: useEditableSidebarItemCallbacks.constructDeleteTransaction.Args<FernApiEditor.TypeId>): FernApiEditor.transactions.Transaction.DeleteType {
    return TransactionGenerator.deleteType({
        typeId,
    });
}

function isEqualToDraft({
    definitionId: typeId,
    draft,
}: useEditableSidebarItemCallbacks.isEqualToDraft.Args<FernApiEditor.TypeId>): boolean {
    return draft.type === "type" && draft.typeId === typeId;
}
