import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractUnionTransactionHander } from "./AbstractUnionTransactionHander";

export class DeleteUnionMemberTransactionHandlerHandler extends AbstractUnionTransactionHander<FernApiEditor.transactions.DeleteUnionMemberTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.DeleteUnionMemberTransaction): void {
        const union = this.getUnionOrThrow(transaction.unionId);
        const indexOfMember = union.members.findIndex((member) => member.unionMemberId === transaction.unionMemberId);
        if (indexOfMember === -1) {
            throw new Error(`Union member ${transaction.unionMemberId} does not exist`);
        }
        union.members.splice(indexOfMember, 1);
    }
}
