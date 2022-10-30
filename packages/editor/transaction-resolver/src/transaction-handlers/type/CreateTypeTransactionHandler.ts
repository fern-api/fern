import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class CreateTypeTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.CreateTypeTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.CreateTypeTransaction
    ): void {
        const package_ = this.getPackageOrThrow(api, transaction.packageId);
        package_.types.push({
            typeId: transaction.typeId,
            typeName: transaction.typeName,
        });
    }
}
