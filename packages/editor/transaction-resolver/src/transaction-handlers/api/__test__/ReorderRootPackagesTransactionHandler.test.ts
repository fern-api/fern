import { TransactionGenerator } from "@fern-api/transaction-generator";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("ReorderRootPackagesTransactionHandler", () => {
    it("correctly re-orders packages", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        const third = api.addPackage();
        const newOrder = [second.packageId, first.packageId, third.packageId];
        const transaction = TransactionGenerator.reorderRootPackages({ newOrder });
        api.applyTransaction(transaction);

        expect(api.definition.rootPackages).toEqual(newOrder);
    });

    it("throws when new order's length is incorrect", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        api.addPackage();
        const newOrder = [second.packageId, first.packageId];
        const transaction = TransactionGenerator.reorderRootPackages({ newOrder });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains duplicates", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        api.addPackage();
        const newOrder = [second.packageId, first.packageId, first.packageId];
        const transaction = TransactionGenerator.reorderRootPackages({ newOrder });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains non-existent package", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        api.addPackage();
        const newOrder = [second.packageId, first.packageId, "made-up-id"];
        const transaction = TransactionGenerator.reorderRootPackages({ newOrder });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
