import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("CreatePackageTransactionHandler", () => {
    it("correctly adds package", () => {
        const api = new MockApi();
        const packageId = EditorItemIdGenerator.package();

        const transaction = TransactionGenerator.createPackage({
            packageId,
            packageName: "My new package",
        });
        api.applyTransaction(transaction);

        const expectedNewPackage: FernApiEditor.Package = {
            packageId,
            packageName: "My new package",
            packages: [],
            endpoints: [],
            types: [],
            errors: [],
        };

        expect(api.definition.packages[packageId]).toEqual(expectedNewPackage);
    });
});
