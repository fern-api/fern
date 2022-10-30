import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class ReorderEndpointsTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.ReorderEndpointsTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.ReorderEndpointsTransaction
    ): void {
        const package_ = this.getPackageOrThrow(api, transaction.packageId);
        if (package_.endpoints.length !== transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order endpoints in package ${transaction.packageId} because new order has length ${transaction.newOrder.length} and existing endpoints have length ${package_.endpoints.length}`
            );
        }

        const newOrderSet = new Set(transaction.newOrder);
        if (newOrderSet.size < transaction.newOrder.length) {
            throw new Error(
                `Cannot re-order endpoints in package ${transaction.packageId} because new order contains duplicates`
            );
        }

        package_.endpoints = transaction.newOrder.map((endpointId) =>
            this.getEndpointOrThrow(api, transaction.packageId, endpointId)
        );
    }
}
