import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class SetTypeDescriptionTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.SetTypeDescriptionTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.SetTypeDescriptionTransaction): void {
        const type = this.getTypeOrThrow(transaction.typeId);
        type.description =
            transaction.description != null && transaction.description.length > 0 ? transaction.description : undefined;
    }
}
