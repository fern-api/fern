import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { Draft } from "immer";
import { AbstractTransactionHandler } from "../AbstractTransactionHandler";

export abstract class AbstractUnionTransactionHander<T> extends AbstractTransactionHandler<T> {
    protected getUnionOrThrow(unionId: FernApiEditor.TypeId): Draft<FernApiEditor.UnionShape> {
        const type = this.getTypeOrThrow(unionId);
        if (type.shape.type !== "union") {
            throw new Error(`Type ${unionId} is not a union`);
        }
        return type.shape;
    }

    protected getUnionMemberOrThrow(
        unionId: FernApiEditor.TypeId,
        memberId: FernApiEditor.UnionMemberId
    ): Draft<FernApiEditor.UnionMember> {
        const union = this.getUnionOrThrow(unionId);
        const member = union.members.find((member) => member.unionMemberId === memberId);
        if (member == null) {
            throw new Error(`Member ${memberId} does not exist`);
        }
        return member;
    }
}
