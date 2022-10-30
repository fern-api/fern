import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class DeleteEndpointTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.DeleteEndpointTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.DeleteEndpointTransaction
    ): void {
        const package_ = this.getPackageOrThrow(api, transaction.packageId);
        const indexToDelete = package_.endpoints.findIndex((e) => e.endpointId === transaction.endpointId);
        if (indexToDelete === -1) {
            throw new Error(`Endpoint ${transaction.endpointId} does not exist`);
        }
        package_.endpoints.splice(indexToDelete, 1);
    }
}
