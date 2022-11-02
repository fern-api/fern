import { TransactionGenerator } from "@fern-api/transaction-generator";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("ReorderPackagesTransactionHandler", () => {
    it("correctly re-orders packages", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addPackage();
        const second = package_.addPackage();
        const third = package_.addPackage();
        const newOrder = [second.packageId, first.packageId, third.packageId];
        const transaction = TransactionGenerator.reorderPackages({
            packageId: package_.packageId,
            newOrder,
        });
        api.applyTransaction(transaction);

        expect(api.definition.packages[package_.packageId]?.packages).toEqual(newOrder);
    });

    it("throws when new order's length is incorrect", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addPackage();
        const second = package_.addPackage();
        package_.addPackage();
        const newOrder = [second.packageId, first.packageId];
        const transaction = TransactionGenerator.reorderPackages({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains duplicates", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addPackage();
        const second = package_.addPackage();
        package_.addPackage();
        const newOrder = [second.packageId, first.packageId, first.packageId];
        const transaction = TransactionGenerator.reorderPackages({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains non-existent package", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addPackage();
        const second = package_.addPackage();
        package_.addPackage();
        const newOrder = [second.packageId, first.packageId, "made-up-id"];
        const transaction = TransactionGenerator.reorderPackages({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
