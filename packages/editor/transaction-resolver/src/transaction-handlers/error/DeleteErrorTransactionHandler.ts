import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class DeleteErrorTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.DeleteErrorTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.DeleteErrorTransaction
    ): void {
        const package_ = this.getPackageOrThrow(api, transaction.packageId);
        const indexToDelete = package_.errors.findIndex((e) => e.errorId === transaction.errorId);
        if (indexToDelete === -1) {
            throw new Error(`Error ${transaction.errorId} does not exist`);
        }
        package_.errors.splice(indexToDelete, 1);
    }
}
