import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class ReorderPackagesTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.ReorderPackagesTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.ReorderPackagesTransaction
    ): void {
        if (api.packages.length !== transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order packages because new order has length ${transaction.newOrder.length} and existing packages have length ${api.packages.length}`
            );
        }

        const newOrderSet = new Set(transaction.newOrder);
        if (newOrderSet.size < transaction.newOrder.length) {
            throw new Error("Cannot re-order packages because new order contains duplicates");
        }

        api.packages = transaction.newOrder.map((packageId) => this.getPackageOrThrow(api, packageId));
    }
}
