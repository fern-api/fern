import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class ReorderRootPackagesTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.ReorderRootPackagesTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.ReorderRootPackagesTransaction): void {
        if (this.definition.rootPackages.length !== transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order packages because new order has length ${transaction.newOrder.length} and existing packages have length ${this.definition.rootPackages.length}`
            );
        }

        const newOrderSet = new Set(transaction.newOrder);
        if (newOrderSet.size < transaction.newOrder.length) {
            throw new Error("Cannot re-order packages because new order contains duplicates");
        }

        this.definition.rootPackages = transaction.newOrder.map(
            (packageId) => this.getPackageOrThrow(packageId).packageId
        );
    }
}
