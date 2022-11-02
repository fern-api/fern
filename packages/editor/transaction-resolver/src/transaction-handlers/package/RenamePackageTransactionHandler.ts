import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class RenamePackageTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.RenamePackageTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.RenamePackageTransaction): void {
        const package_ = this.getPackageOrThrow(transaction.packageId);
        package_.packageName = transaction.newPackageName;
    }
}
