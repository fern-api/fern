import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { DeleteTypeTransactionHandler } from "../DeleteTypeTransactionHandler";

describe("DeleteTypeTransactionHandler", () => {
    it("correctly delete type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();

        const transaction: FernApiEditor.transactions.DeleteTypeTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            typeId: first.typeId,
        };

        new DeleteTypeTransactionHandler().applyTransaction(api, transaction);

        expect(package_.types).toEqual([second]);
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction: FernApiEditor.transactions.DeleteTypeTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            typeId: first.typeId,
        };

        expect(() => new DeleteTypeTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when type does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const transaction: FernApiEditor.transactions.DeleteTypeTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            typeId: "made-up-id",
        };

        expect(() => new DeleteTypeTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
