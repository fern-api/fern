import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class RenameTypeTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.RenameTypeTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.RenameTypeTransaction): void {
        const type = this.getTypeOrThrow(transaction.typeId);
        type.typeName = transaction.newTypeName;
    }
}
