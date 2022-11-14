import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("DeleteUnionMemberTransactionHandler", () => {
    it("correctly deletes member", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();
        const second = package_.addUnion();

        const unionMemberId = EditorItemIdGenerator.unionMember();
        api.applyTransaction(
            TransactionGenerator.createUnionMember({
                unionId: second.typeId,
                unionMemberId,
                discriminantValue: "dog",
            })
        );

        const transaction = TransactionGenerator.deleteUnionMember({
            unionId: second.typeId,
            unionMemberId,
        });
        api.applyTransaction(transaction);

        const union = api.definition.types[second.typeId];
        if (union?.shape.type !== "union") {
            throw new Error("Type is not a union");
        }
        expect(union.shape.members).toHaveLength(0);
    });

    it("throws when union does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();
        const second = package_.addUnion();

        const unionMemberId = EditorItemIdGenerator.unionMember();
        api.applyTransaction(
            TransactionGenerator.createUnionMember({
                unionId: second.typeId,
                unionMemberId,
                discriminantValue: "dog",
            })
        );
        const transaction = TransactionGenerator.deleteUnionMember({
            unionId: "made-up-id",
            unionMemberId,
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when member does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();
        const second = package_.addUnion();

        const transaction = TransactionGenerator.deleteUnionMember({
            unionId: second.typeId,
            unionMemberId: "made-up-id",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
