import { TransactionGenerator } from "@fern-api/transaction-generator";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("DeleteEndpointTransactionHandler", () => {
    it("correctly delete endpoint", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();

        const transaction = TransactionGenerator.deleteEndpoint({
            endpointId: first.endpointId,
        });
        api.applyTransaction(transaction);

        expect(Object.keys(api.definition.endpoints)).toEqual([second.endpointId]);
    });

    it("throws when endpoint does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addEndpoint();
        package_.addEndpoint();

        const transaction = TransactionGenerator.deleteEndpoint({
            endpointId: "made-up-id",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
