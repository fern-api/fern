import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class ReorderErrorsTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.ReorderErrorsTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.ReorderErrorsTransaction): void {
        const package_ = this.getPackageOrThrow(transaction.packageId);
        if (package_.errors.length !== transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order errors in package ${transaction.packageId} because new order has length ${transaction.newOrder.length} and existing errors have length ${package_.errors.length}`
            );
        }

        const newOrderSet = new Set(transaction.newOrder);
        if (newOrderSet.size < transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order errors in package ${transaction.packageId} because new order contains duplicates`
            );
        }

        package_.errors = transaction.newOrder.map((errorId) => this.getErrorOrThrow(errorId).errorId);
    }
}
