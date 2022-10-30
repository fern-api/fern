import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { ReorderPackagesTransactionHandler } from "../ReorderPackagesTransactionHandler";

describe("ReorderPackagesTransactionHandler", () => {
    it("correctly re-orders packages", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        const third = api.addPackage();
        const newOrder = [second.packageId, first.packageId, third.packageId];
        const transaction: FernApiEditor.transactions.ReorderPackagesTransaction = {
            ...createBaseTransaction(),
            newOrder,
        };
        new ReorderPackagesTransactionHandler().applyTransaction(api, transaction);
        expect(api.packages.map((p) => p.packageId)).toEqual(newOrder);
    });

    it("throws when new order's length is incorrect", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        api.addPackage();
        const newOrder = [second.packageId, first.packageId];
        const transaction: FernApiEditor.transactions.ReorderPackagesTransaction = {
            ...createBaseTransaction(),
            newOrder,
        };
        expect(() => new ReorderPackagesTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when new order contains duplicates", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        api.addPackage();
        const newOrder = [second.packageId, first.packageId, first.packageId];
        const transaction: FernApiEditor.transactions.ReorderPackagesTransaction = {
            ...createBaseTransaction(),
            newOrder,
        };
        expect(() => new ReorderPackagesTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when new order contains non-existent package", () => {
        const api = new MockApi();
        const first = api.addPackage();
        const second = api.addPackage();
        api.addPackage();
        const newOrder = [second.packageId, first.packageId, "made-up-id"];
        const transaction: FernApiEditor.transactions.ReorderPackagesTransaction = {
            ...createBaseTransaction(),
            newOrder,
        };
        expect(() => new ReorderPackagesTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
