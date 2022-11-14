import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractUnionTransactionHander } from "./AbstractUnionTransactionHander";

export class SetUnionMemberDiscriminantValueTransactionHandler extends AbstractUnionTransactionHander<FernApiEditor.transactions.SetUnionMemberDiscriminantValueTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.SetUnionMemberDiscriminantValueTransaction): void {
        const member = this.getUnionMemberOrThrow(transaction.unionId, transaction.unionMemberId);
        member.discriminantValue = transaction.discriminantValue;
    }
}
