import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { RenameTypeTransactionHandler } from "../RenameTypeTransactionHandler";

describe("RenameTypeTransactionHandler", () => {
    it("correctly renames type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction: FernApiEditor.transactions.RenameTypeTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            typeId: first.typeId,
            newTypeName: "New type name",
        };

        new RenameTypeTransactionHandler().applyTransaction(api, transaction);

        expect(package_.types[0]?.typeName).toEqual("New type name");
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction: FernApiEditor.transactions.RenameTypeTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            typeId: first.typeId,
            newTypeName: "New type name",
        };

        expect(() => new RenameTypeTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when type does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const transaction: FernApiEditor.transactions.RenameTypeTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            typeId: "made-up-id",
            newTypeName: "New type name",
        };

        expect(() => new RenameTypeTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
