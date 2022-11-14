import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("CreateUnionMemberTransactionHandler", () => {
    it("correctly adds member", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();
        const second = package_.addUnion();

        const unionMemberId = EditorItemIdGenerator.unionMember();

        const transaction = TransactionGenerator.createUnionMember({
            unionId: second.typeId,
            unionMemberId,
            discriminantValue: "dog",
        });
        api.applyTransaction(transaction);

        const expectedNewMember: FernApiEditor.UnionMember = {
            unionMemberId,
            discriminantValue: "dog",
        };

        const union = api.definition.types[second.typeId];
        if (union?.shape.type !== "union") {
            throw new Error("Type is not a union");
        }
        expect(union.shape.members).toEqual([expectedNewMember]);
    });

    it("throws when union does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();

        const unionMemberId = EditorItemIdGenerator.unionMember();

        const transaction = TransactionGenerator.createUnionMember({
            unionId: "made-up-id",
            unionMemberId,
            discriminantValue: "dog",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
