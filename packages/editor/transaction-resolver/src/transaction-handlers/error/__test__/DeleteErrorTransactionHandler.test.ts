import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("DeleteErrorTransactionHandler", () => {
    it("correctly delete error", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();

        const transaction = TransactionGenerator.deleteError({
            errorId: first.errorId,
        });
        api.applyTransaction(transaction);

        expect(Object.keys(api.definition.errors)).toEqual([second.errorId]);
    });

    it("throws when error does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addError();
        package_.addError();

        const transaction = TransactionGenerator.deleteError({
            errorId: "made-up-id" as FernApiEditor.ErrorId,
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
