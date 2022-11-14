import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("CreateErrorTransactionHandler", () => {
    it("correctly adds error", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addError();
        package_.addError();

        const errorId = EditorItemIdGenerator.error();

        const transaction = TransactionGenerator.createError({
            parent: package_.packageId,
            errorId,
            errorName: "My new error",
        });
        api.applyTransaction(transaction);

        const expectedNewError: FernApiEditor.Error = {
            errorId,
            errorName: "My new error",
        };

        expect(api.definition.errors[errorId]).toEqual(expectedNewError);
    });

    it("throws when parent does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();

        const transaction = TransactionGenerator.createError({
            parent: "made-up-id" as FernApiEditor.PackageId,
            errorId: EditorItemIdGenerator.error(),
            errorName: "My new error",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
