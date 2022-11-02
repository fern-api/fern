import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class ReorderPackagesTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.ReorderPackagesTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.ReorderPackagesTransaction): void {
        const package_ = this.getPackageOrThrow(transaction.packageId);
        if (package_.packages.length !== transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order packages in package ${transaction.packageId} because new order has length ${transaction.newOrder.length} and existing packages have length ${package_.packages.length}`
            );
        }

        const newOrderSet = new Set(transaction.newOrder);
        if (newOrderSet.size < transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order packages in package ${transaction.packageId} because new order contains duplicates`
            );
        }

        package_.packages = transaction.newOrder.map((packageId) => this.getPackageOrThrow(packageId).packageId);
    }
}
