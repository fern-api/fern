import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class RenameErrorTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.RenameErrorTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.RenameErrorTransaction
    ): void {
        const error = this.getErrorOrThrow(api, transaction.packageId, transaction.errorId);
        error.errorName = transaction.newErrorName;
    }
}
