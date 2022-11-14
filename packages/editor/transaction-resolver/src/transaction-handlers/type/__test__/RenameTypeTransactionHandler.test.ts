import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("RenameTypeTransactionHandler", () => {
    it("correctly renames type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.renameType({
            typeId: first.typeId,
            newTypeName: "New type name",
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.typeName).toEqual("New type name");
    });

    it("throws when type does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.renameType({
            typeId: "made-up-id" as FernApiEditor.TypeId,
            newTypeName: "New type name",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
