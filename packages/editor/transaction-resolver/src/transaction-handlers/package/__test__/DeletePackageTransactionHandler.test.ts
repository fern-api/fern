import { TransactionGenerator } from "@fern-api/transaction-generator";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("DeletePackageTransactionHandler", () => {
    it("correctly deletes root package", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        const third = api.addPackage();

        const transaction = TransactionGenerator.deletePackage({
            packageId: second.packageId,
        });
        api.applyTransaction(transaction);

        expect(api.definition.rootPackages).toEqual([first.packageId, third.packageId]);
        expect(Object.keys(api.definition.packages)).toEqual([first.packageId, third.packageId]);
    });

    it("correctly deletes non-root package", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addPackage();
        const second = package_.addPackage();
        const third = package_.addPackage();

        const transaction = TransactionGenerator.deletePackage({
            packageId: second.packageId,
        });
        api.applyTransaction(transaction);

        expect(api.definition.packages[package_.packageId]?.packages).toEqual([first.packageId, third.packageId]);
    });

    it("throws when parent does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();
        api.addPackage();

        const transaction = TransactionGenerator.deletePackage({
            packageId: "made-up-id",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
