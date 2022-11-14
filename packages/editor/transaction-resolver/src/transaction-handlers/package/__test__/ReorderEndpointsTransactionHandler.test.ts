import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("ReorderEndpointsTransactionHandler", () => {
    it("correctly re-orders endpoints", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();
        const third = package_.addEndpoint();
        const newOrder = [second.endpointId, first.endpointId, third.endpointId];
        const transaction = TransactionGenerator.reorderEndpoints({
            packageId: package_.packageId,
            newOrder,
        });
        api.applyTransaction(transaction);

        expect(api.definition.packages[package_.packageId]?.endpoints).toEqual(newOrder);
    });

    it("throws when new order's length is incorrect", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();
        package_.addEndpoint();
        const newOrder = [second.endpointId, first.endpointId];
        const transaction = TransactionGenerator.reorderEndpoints({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains duplicates", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();
        package_.addEndpoint();
        const newOrder = [second.endpointId, first.endpointId, first.endpointId];
        const transaction = TransactionGenerator.reorderEndpoints({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when new order contains non-existent package", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();
        package_.addEndpoint();
        const newOrder = [second.endpointId, first.endpointId, "made-up-id" as FernApiEditor.EndpointId];
        const transaction = TransactionGenerator.reorderEndpoints({
            packageId: package_.packageId,
            newOrder,
        });
        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
