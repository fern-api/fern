import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class ReorderTypesTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.ReorderTypesTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.ReorderTypesTransaction
    ): void {
        const package_ = this.getPackageOrThrow(api, transaction.packageId);
        if (package_.types.length !== transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order types in package ${transaction.packageId} because new order has length ${transaction.newOrder.length} and existing types have length ${package_.types.length}`
            );
        }

        const newOrderSet = new Set(transaction.newOrder);
        if (newOrderSet.size < transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order types in package ${transaction.packageId} because new order contains duplicates`
            );
        }

        package_.types = transaction.newOrder.map((typeId) => this.getTypeOrThrow(api, transaction.packageId, typeId));
    }
}
