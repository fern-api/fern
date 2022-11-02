import { TransactionGenerator } from "@fern-api/transaction-generator";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("RenameErrorTransactionHandler", () => {
    it("correctly renames error", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        package_.addError();

        const transaction = TransactionGenerator.renameError({
            errorId: first.errorId,
            newErrorName: "New error name",
        });

        api.applyTransaction(transaction);

        expect(api.definition.errors[first.errorId]?.errorName).toEqual("New error name");
    });

    it("throws when error does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addError();
        package_.addError();

        const transaction = TransactionGenerator.renameError({
            errorId: "made-up-id",
            newErrorName: "New error name",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
