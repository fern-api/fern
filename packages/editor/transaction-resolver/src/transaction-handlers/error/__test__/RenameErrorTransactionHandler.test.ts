import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { RenameErrorTransactionHandler } from "../RenameErrorTransactionHandler";

describe("RenameErrorTransactionHandler", () => {
    it("correctly renames error", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        package_.addError();

        const transaction: FernApiEditor.transactions.RenameErrorTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            errorId: first.errorId,
            newErrorName: "New error name",
        };

        new RenameErrorTransactionHandler().applyTransaction(api, transaction);

        expect(package_.errors[0]?.errorName).toEqual("New error name");
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        package_.addError();

        const transaction: FernApiEditor.transactions.RenameErrorTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            errorId: first.errorId,
            newErrorName: "New error name",
        };

        expect(() => new RenameErrorTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when error does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addError();
        package_.addError();

        const transaction: FernApiEditor.transactions.RenameErrorTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            errorId: "made-up-id",
            newErrorName: "New error name",
        };

        expect(() => new RenameErrorTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
