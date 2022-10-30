import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class CreateEndpointTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.CreateEndpointTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.CreateEndpointTransaction
    ): void {
        const package_ = this.getPackageOrThrow(api, transaction.packageId);
        package_.endpoints.push({
            endpointId: transaction.endpointId,
            endpointName: transaction.endpointName,
        });
    }
}
