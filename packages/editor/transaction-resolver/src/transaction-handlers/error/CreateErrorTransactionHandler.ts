import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class CreateErrorTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.CreateErrorTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.CreateErrorTransaction
    ): void {
        const package_ = this.getPackageOrThrow(api, transaction.packageId);
        package_.errors.push({
            errorId: transaction.errorId,
            errorName: transaction.errorName,
            statusCode: "400",
        });
    }
}
