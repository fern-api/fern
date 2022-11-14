import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractUnionTransactionHander } from "./AbstractUnionTransactionHander";

export class CreateUnionMemberTransactionHandler extends AbstractUnionTransactionHander<FernApiEditor.transactions.CreateUnionMemberTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.CreateUnionMemberTransaction): void {
        const union = this.getUnionOrThrow(transaction.unionId);
        union.members.push({
            unionMemberId: transaction.unionMemberId,
            discriminantValue: transaction.discriminantValue,
        });
    }
}
