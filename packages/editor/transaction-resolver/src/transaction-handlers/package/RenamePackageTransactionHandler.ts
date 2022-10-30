import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class RenamePackageTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.RenamePackageTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.RenamePackageTransaction
    ): void {
        const package_ = this.getPackageOrThrow(api, transaction.packageId);
        package_.packageName = transaction.newPackageName;
    }
}
