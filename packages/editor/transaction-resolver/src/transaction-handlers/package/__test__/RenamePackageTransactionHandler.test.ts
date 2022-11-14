import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("RenamePackageTransactionHandler", () => {
    it("correctly renames package", () => {
        const api = new MockApi();
        const first = api.addPackage();
        api.addPackage();

        const transaction = TransactionGenerator.renamePackage({
            packageId: first.packageId,
            newPackageName: "New package name",
        });
        api.applyTransaction(transaction);

        expect(api.definition.packages[first.packageId]?.packageName).toEqual("New package name");
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();

        const transaction = TransactionGenerator.renamePackage({
            packageId: "made-up-id" as FernApiEditor.PackageId,
            newPackageName: "New package name",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
