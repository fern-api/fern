import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { ReorderEndpointsTransactionHandler } from "../ReorderEndpointsTransactionHandler";

describe("ReorderEndpointsTransactionHandler", () => {
    it("correctly re-orders endpoints", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();
        const third = package_.addEndpoint();
        const newOrder = [second.endpointId, first.endpointId, third.endpointId];
        const transaction: FernApiEditor.transactions.ReorderEndpointsTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        new ReorderEndpointsTransactionHandler().applyTransaction(api, transaction);
        expect(package_.endpoints.map((p) => p.endpointId)).toEqual(newOrder);
    });

    it("throws when new order's length is incorrect", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();
        package_.addEndpoint();
        const newOrder = [second.endpointId, first.endpointId];
        const transaction: FernApiEditor.transactions.ReorderEndpointsTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        expect(() => new ReorderEndpointsTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when new order contains duplicates", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();
        package_.addEndpoint();
        const newOrder = [second.endpointId, first.endpointId, first.endpointId];
        const transaction: FernApiEditor.transactions.ReorderEndpointsTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        expect(() => new ReorderEndpointsTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when new order contains non-existent package", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();
        package_.addEndpoint();
        const newOrder = [second.endpointId, first.endpointId, "made-up-id"];
        const transaction: FernApiEditor.transactions.ReorderEndpointsTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            newOrder,
        };
        expect(() => new ReorderEndpointsTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
