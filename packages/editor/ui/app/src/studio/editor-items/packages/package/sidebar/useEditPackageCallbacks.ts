import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useEditableSidebarItemCallbacks } from "../../../shared/sidebar/useEditableSidebarItemCallbacks";

export type PackageParentId = FernApiEditor.PackageId | undefined;

export declare namespace useEditPackageCallbacks {
    export interface Args {
        packageId: FernApiEditor.PackageId;
        parent: PackageParentId;
    }
}

export function useEditPackageCallbacks({
    packageId,
    parent,
}: useEditPackageCallbacks.Args): useEditableSidebarItemCallbacks.Return {
    return useEditableSidebarItemCallbacks({
        definitionId: packageId,
        parent,
        constructCreateTransaction,
        constructRenameTransaction,
        constructDeleteTransaction,
        isEqualToDraft,
    });
}

function constructCreateTransaction({
    name: packageName,
    parent,
    definitionId: packageId,
}: useEditableSidebarItemCallbacks.constructCreateTransaction.Args<
    FernApiEditor.PackageId,
    PackageParentId
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
}: useEditableSidebarItemCallbacks.constructRenameTransaction.Args<
    FernApiEditor.PackageId,
    PackageParentId
>): FernApiEditor.transactions.Transaction.RenamePackage {
    return TransactionGenerator.renamePackage({
        packageId,
        newPackageName,
    });
}

function constructDeleteTransaction({
    definitionId: packageId,
}: useEditableSidebarItemCallbacks.constructDeleteTransaction.Args<
    FernApiEditor.PackageId,
    PackageParentId
>): FernApiEditor.transactions.Transaction.DeletePackage {
    return TransactionGenerator.deletePackage({
        packageId,
    });
}

function isEqualToDraft({
    definitionId: packageId,
    draft,
}: useEditableSidebarItemCallbacks.isEqualToDraft.Args<FernApiEditor.PackageId, PackageParentId>): boolean {
    return draft.type === "package" && draft.packageId === packageId;
}
