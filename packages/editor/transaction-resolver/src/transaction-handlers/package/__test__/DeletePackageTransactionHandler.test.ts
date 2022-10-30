import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { DeletePackageTransactionHandler } from "../DeletePackageTransactionHandler";

describe("DeletePackageTransactionHandler", () => {
    it("correctly delete package", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        const third = api.addPackage();

        const transaction: FernApiEditor.transactions.DeletePackageTransaction = {
            ...createBaseTransaction(),
            packageId: second.packageId,
        };

        new DeletePackageTransactionHandler().applyTransaction(api, transaction);

        expect(api.packages).toEqual([first, third]);
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();
        api.addPackage();

        const transaction: FernApiEditor.transactions.DeletePackageTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
        };

        expect(() => new DeletePackageTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
