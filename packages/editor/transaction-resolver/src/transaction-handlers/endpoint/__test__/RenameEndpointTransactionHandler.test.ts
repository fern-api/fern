import { TransactionGenerator } from "@fern-api/transaction-generator";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("RenameEndpointTransactionHandler", () => {
    it("correctly renames endpoint", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        package_.addEndpoint();

        const transaction = TransactionGenerator.renameEndpoint({
            endpointId: first.endpointId,
            newEndpointName: "New endpoint name",
        });
        api.applyTransaction(transaction);

        expect(api.definition.endpoints[first.endpointId]?.endpointName).toEqual("New endpoint name");
    });

    it("throws when endpoint does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addEndpoint();
        package_.addEndpoint();

        const transaction = TransactionGenerator.renameEndpoint({
            endpointId: "made-up-id",
            newEndpointName: "New endpoint name",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
