import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useEditableSidebarItemCallbacks } from "../../../shared/useEditableSidebarItemCallbacks";

export declare namespace useEditErrorCallbacks {
    export interface Args {
        errorId: FernApiEditor.ErrorId;
        parent: FernApiEditor.PackageId;
    }
}

export function useEditErrorCallbacks({
    errorId,
    parent,
}: useEditErrorCallbacks.Args): useEditableSidebarItemCallbacks.Return {
    return useEditableSidebarItemCallbacks({
        definitionId: errorId,
        parent,
        constructCreateTransaction,
        constructRenameTransaction,
        constructDeleteTransaction,
        isEqualToDraft,
    });
}

function constructCreateTransaction({
    name: errorName,
    parent,
    definitionId: errorId,
}: useEditableSidebarItemCallbacks.constructCreateTransaction.Args<FernApiEditor.ErrorId>): FernApiEditor.transactions.Transaction.CreateError {
    return TransactionGenerator.createError({
        errorId,
        errorName,
        parent,
    });
}

function constructRenameTransaction({
    newName: newErrorName,
    definitionId: errorId,
}: useEditableSidebarItemCallbacks.constructRenameTransaction.Args<FernApiEditor.ErrorId>): FernApiEditor.transactions.Transaction.RenameError {
    return TransactionGenerator.renameError({
        errorId,
        newErrorName,
    });
}

function constructDeleteTransaction({
    definitionId: errorId,
}: useEditableSidebarItemCallbacks.constructDeleteTransaction.Args<FernApiEditor.ErrorId>): FernApiEditor.transactions.Transaction.DeleteError {
    return TransactionGenerator.deleteError({
        errorId,
    });
}

function isEqualToDraft({
    definitionId: errorId,
    draft,
}: useEditableSidebarItemCallbacks.isEqualToDraft.Args<FernApiEditor.ErrorId>): boolean {
    return draft.type === "error" && draft.errorId === errorId;
}
