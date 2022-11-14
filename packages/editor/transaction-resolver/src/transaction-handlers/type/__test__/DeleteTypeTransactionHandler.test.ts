import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("DeleteTypeTransactionHandler", () => {
    it("correctly delete type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();

        const transaction = TransactionGenerator.deleteType({
            typeId: first.typeId,
        });
        api.applyTransaction(transaction);

        expect(Object.keys(api.definition.types)).toEqual([second.typeId]);
    });

    it("throws when type does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.deleteType({
            typeId: "made-up-id" as FernApiEditor.TypeId,
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
