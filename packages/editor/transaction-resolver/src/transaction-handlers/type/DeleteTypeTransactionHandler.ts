import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class DeleteTypeTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.DeleteTypeTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.DeleteTypeTransaction
    ): void {
        const package_ = this.getPackageOrThrow(api, transaction.packageId);
        const indexToDelete = package_.types.findIndex((t) => t.typeId === transaction.typeId);
        if (indexToDelete === -1) {
            throw new Error(`Type ${transaction.typeId} does not exist`);
        }
        package_.types.splice(indexToDelete, 1);
    }
}
