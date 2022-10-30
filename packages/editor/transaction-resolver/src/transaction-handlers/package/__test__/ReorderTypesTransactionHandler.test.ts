import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { ReorderTypesTransactionHandler } from "../ReorderTypesTransactionHandler";

describe("ReorderTypesTransactionHandler", () => {
    it("correctly re-orders types", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();
        const third = package_.addType();
        const newOrder = [second.typeId, first.typeId, third.typeId];
        const transaction: FernApiEditor.transactions.ReorderTypesTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        new ReorderTypesTransactionHandler().applyTransaction(api, transaction);
        expect(package_.types.map((p) => p.typeId)).toEqual(newOrder);
    });

    it("throws when new order's length is incorrect", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();
        package_.addType();
        const newOrder = [second.typeId, first.typeId];
        const transaction: FernApiEditor.transactions.ReorderTypesTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        expect(() => new ReorderTypesTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when new order contains duplicates", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();
        package_.addType();
        const newOrder = [second.typeId, first.typeId, first.typeId];
        const transaction: FernApiEditor.transactions.ReorderTypesTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        expect(() => new ReorderTypesTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when new order contains non-existent package", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        const second = package_.addType();
        package_.addType();
        const newOrder = [second.typeId, first.typeId, "made-up-id"];
        const transaction: FernApiEditor.transactions.ReorderTypesTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        expect(() => new ReorderTypesTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
