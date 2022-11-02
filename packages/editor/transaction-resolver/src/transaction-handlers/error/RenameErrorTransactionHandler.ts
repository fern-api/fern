import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class RenameErrorTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.RenameErrorTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.RenameErrorTransaction): void {
        const error = this.getErrorOrThrow(transaction.errorId);
        error.errorName = transaction.newErrorName;
    }
}
