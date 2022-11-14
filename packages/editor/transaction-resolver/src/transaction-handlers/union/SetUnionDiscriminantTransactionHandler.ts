import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractUnionTransactionHander } from "./AbstractUnionTransactionHander";

export class SetUnionDiscriminantTransactionHandler extends AbstractUnionTransactionHander<FernApiEditor.transactions.SetUnionDiscriminantTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.SetUnionDiscriminantTransaction): void {
        const union = this.getUnionOrThrow(transaction.unionId);
        union.discriminant = transaction.discriminant;
    }
}
