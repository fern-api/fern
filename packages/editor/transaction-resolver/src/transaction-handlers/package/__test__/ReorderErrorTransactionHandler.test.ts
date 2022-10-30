import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { ReorderErrorsTransactionHandler } from "../ReorderErrorsTransactionHandler";

describe("ReorderErrorsTransactionHandler", () => {
    it("correctly re-orders errors", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();
        const third = package_.addError();
        const newOrder = [second.errorId, first.errorId, third.errorId];
        const transaction: FernApiEditor.transactions.ReorderErrorsTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        new ReorderErrorsTransactionHandler().applyTransaction(api, transaction);
        expect(package_.errors.map((p) => p.errorId)).toEqual(newOrder);
    });

    it("throws when new order's length is incorrect", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();
        package_.addError();
        const newOrder = [second.errorId, first.errorId];
        const transaction: FernApiEditor.transactions.ReorderErrorsTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        expect(() => new ReorderErrorsTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when new order contains duplicates", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();
        package_.addError();
        const newOrder = [second.errorId, first.errorId, first.errorId];
        const transaction: FernApiEditor.transactions.ReorderErrorsTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        expect(() => new ReorderErrorsTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when new order contains non-existent package", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addError();
        const second = package_.addError();
        package_.addError();
        const newOrder = [second.errorId, first.errorId, "made-up-id"];
        const transaction: FernApiEditor.transactions.ReorderErrorsTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        expect(() => new ReorderErrorsTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
