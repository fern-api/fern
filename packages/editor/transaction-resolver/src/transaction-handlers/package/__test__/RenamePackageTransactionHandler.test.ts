import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { RenamePackageTransactionHandler } from "../RenamePackageTransactionHandler";

describe("RenamePackageTransactionHandler", () => {
    it("correctly renames package", () => {
        const api = new MockApi();
        const first = api.addPackage();
        api.addPackage();

        const transaction: FernApiEditor.transactions.RenamePackageTransaction = {
            ...createBaseTransaction(),
            packageId: first.packageId,
            newPackageName: "New package name",
        };

        new RenamePackageTransactionHandler().applyTransaction(api, transaction);

        expect(api.packages[0]?.packageName).toEqual("New package name");
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();

        const transaction: FernApiEditor.transactions.RenamePackageTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            newPackageName: "New package name",
        };

        expect(() => new RenamePackageTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
