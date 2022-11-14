import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("SetUnionMemberDiscriminantValueTransactionHandler", () => {
    it("correctly sets member", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();
        const second = package_.addUnion();
        package_.addUnion();

        const unionMemberId = EditorItemIdGenerator.unionMember();
        api.applyTransaction(
            TransactionGenerator.createUnionMember({
                unionId: second.typeId,
                unionMemberId,
                discriminantValue: "dog",
            })
        );

        const transaction = TransactionGenerator.setUnionMemberDiscriminantValue({
            unionId: second.typeId,
            unionMemberId,
            discriminantValue: "cat",
        });
        api.applyTransaction(transaction);

        const union = api.definition.types[second.typeId];
        if (union?.shape.type !== "union") {
            throw new Error("Type is not a union");
        }
        expect(union.shape.members[0]?.discriminantValue).toEqual("cat");
    });

    it("throws when union does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();
        const second = package_.addUnion();
        package_.addUnion();

        const unionMemberId = EditorItemIdGenerator.unionMember();
        api.applyTransaction(
            TransactionGenerator.createUnionMember({
                unionId: second.typeId,
                unionMemberId,
                discriminantValue: "dog",
            })
        );

        const transaction = TransactionGenerator.setUnionMemberDiscriminantValue({
            unionId: "made-up-id" as FernApiEditor.TypeId,
            unionMemberId,
            discriminantValue: "cat",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when member does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();
        const second = package_.addUnion();

        const transaction = TransactionGenerator.setUnionMemberDiscriminantValue({
            unionId: second.typeId,
            unionMemberId: "made-up-id" as FernApiEditor.UnionMemberId,
            discriminantValue: "dog",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
