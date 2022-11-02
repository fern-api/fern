import { TransactionGenerator } from "@fern-api/transaction-generator";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("ReorderTypesTransactionHandler", () => {
    it("correctly re-orders types", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();
        const third = package_.addType();
        const newOrder = [second.typeId, first.typeId, third.typeId];
        const transaction = TransactionGenerator.reorderTypes({
            packageId: package_.packageId,
            newOrder,
        });
        api.applyTransaction(transaction);

        expect(api.definition.packages[package_.packageId]?.types).toEqual(newOrder);
    });

    it("throws when new order's length is incorrect", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();
        package_.addType();
        const newOrder = [second.typeId, first.typeId];
        const transaction = TransactionGenerator.reorderTypes({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains duplicates", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();
        package_.addType();
        const newOrder = [second.typeId, first.typeId, first.typeId];
        const transaction = TransactionGenerator.reorderTypes({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains non-existent package", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();
        package_.addType();
        const newOrder = [second.typeId, first.typeId, "made-up-id"];
        const transaction = TransactionGenerator.reorderTypes({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
