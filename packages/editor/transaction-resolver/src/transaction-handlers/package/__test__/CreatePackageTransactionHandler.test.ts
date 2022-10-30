import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { generatePackageId } from "../../../testing-utils/ids";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { CreatePackageTransactionHandler } from "../CreatePackageTransactionHandler";

describe("CreatePackageTransactionHandler", () => {
    it("correctly adds package", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();

        const packageId = generatePackageId();

        const transaction: FernApiEditor.transactions.CreatePackageTransaction = {
            ...createBaseTransaction(),
            packageId,
            packageName: "My new package",
        };

        new CreatePackageTransactionHandler().applyTransaction(api, transaction);

        const expectedNewPackage: FernApiEditor.Package = {
            packageId,
            packageName: "My new package",
            endpoints: [],
            types: [],
            errors: [],
        };

        expect(api.packages[2]).toEqual(expectedNewPackage);
    });
});
