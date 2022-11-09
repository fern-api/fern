import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export class SetTypeShapeTransactionHandler extends AbstractTransactionHandler<FernApiEditor.transactions.SetTypeShapeTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.SetTypeShapeTransaction): void {
        const type = this.getTypeOrThrow(transaction.typeId);
        type.shape = transaction.shape;
    }
}
