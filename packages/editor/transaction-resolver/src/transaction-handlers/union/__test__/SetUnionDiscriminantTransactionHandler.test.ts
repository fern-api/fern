import { TransactionGenerator } from "@fern-api/transaction-generator";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("SetUnionDiscriminantTransactionHandler", () => {
    it("correctly sets disciminant", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();
        const second = package_.addUnion();

        const transaction = TransactionGenerator.setUnionDiscriminant({
            unionId: second.typeId,
            discriminant: "new-discriminant",
        });
        api.applyTransaction(transaction);

        const object = api.definition.types[second.typeId];
        if (object?.shape.type !== "union") {
            throw new Error("Type is not a union");
        }
        expect(object.shape.discriminant).toEqual("new-discriminant");
    });

    it("throws when unin does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addUnion();
        package_.addUnion();

        const transaction = TransactionGenerator.setUnionDiscriminant({
            unionId: "made-up-id",
            discriminant: "new-discriminant",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
