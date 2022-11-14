import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("ReorderErrorsTransactionHandler", () => {
    it("correctly re-orders errors", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();
        const third = package_.addError();
        const newOrder = [second.errorId, first.errorId, third.errorId];
        const transaction = TransactionGenerator.reorderErrors({
            packageId: package_.packageId,
            newOrder,
        });
        api.applyTransaction(transaction);

        expect(api.definition.packages[package_.packageId]?.errors).toEqual(newOrder);
    });

    it("throws when new order's length is incorrect", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();
        package_.addError();
        const newOrder = [second.errorId, first.errorId];
        const transaction = TransactionGenerator.reorderErrors({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains duplicates", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();
        package_.addError();
        const newOrder = [second.errorId, first.errorId, first.errorId];
        const transaction = TransactionGenerator.reorderErrors({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains non-existent package", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();
        package_.addError();
        const newOrder = [second.errorId, first.errorId, "made-up-id" as FernApiEditor.ErrorId];
        const transaction = TransactionGenerator.reorderErrors({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
