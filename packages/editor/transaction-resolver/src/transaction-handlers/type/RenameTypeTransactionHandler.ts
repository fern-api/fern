import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class RenameTypeTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.RenameTypeTransaction> {
    public applyTransaction(
        api: FernApiEditor.Api,
        transaction: FernApiEditor.transactions.RenameTypeTransaction
    ): void {
        const type = this.getTypeOrThrow(api, transaction.packageId, transaction.typeId);
        type.typeName = transaction.newTypeName;
    }
}
