import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class CreatePackageTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.CreatePackageTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.CreatePackageTransaction
    ): void {
        api.packages.push({
            packageId: transaction.packageId,
            packageName: transaction.packageName,
            endpoints: [],
            types: [],
            errors: [],
        });
    }
}
