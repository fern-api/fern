import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { DeleteErrorTransactionHandler } from "../DeleteErrorTransactionHandler";

describe("DeleteErrorTransactionHandler", () => {
    it("correctly delete error", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();

        const transaction: FernApiEditor.transactions.DeleteErrorTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            errorId: first.errorId,
        };

        new DeleteErrorTransactionHandler().applyTransaction(api, transaction);

        expect(package_.errors).toEqual([second]);
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        package_.addError();

        const transaction: FernApiEditor.transactions.DeleteErrorTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            errorId: first.errorId,
        };

        expect(() => new DeleteErrorTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when error does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addError();
        package_.addError();

        const transaction: FernApiEditor.transactions.DeleteErrorTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            errorId: "made-up-id",
        };

        expect(() => new DeleteErrorTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
