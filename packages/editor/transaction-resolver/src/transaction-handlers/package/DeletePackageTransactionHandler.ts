import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class DeletePackageTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.DeletePackageTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.DeletePackageTransaction
    ): void {
        const indexToDelete = api.packages.findIndex((p) => p.packageId === transaction.packageId);
        if (indexToDelete === -1) {
            throw new Error(`Package ${transaction.packageId} does not exist`);
        }
        api.packages.splice(indexToDelete, 1);
    }
}
