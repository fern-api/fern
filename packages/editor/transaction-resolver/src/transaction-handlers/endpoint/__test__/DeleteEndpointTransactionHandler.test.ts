import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { DeleteEndpointTransactionHandler } from "../DeleteEndpointTransactionHandler";

describe("DeleteEndpointTransactionHandler", () => {
    it("correctly delete endpoint", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        const second = package_.addEndpoint();

        const transaction: FernApiEditor.transactions.DeleteEndpointTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            endpointId: first.endpointId,
        };

        new DeleteEndpointTransactionHandler().applyTransaction(api, transaction);

        expect(package_.endpoints).toEqual([second]);
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        package_.addEndpoint();

        const transaction: FernApiEditor.transactions.DeleteEndpointTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            endpointId: first.endpointId,
        };

        expect(() => new DeleteEndpointTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when endpoint does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addEndpoint();
        package_.addEndpoint();

        const transaction: FernApiEditor.transactions.DeleteEndpointTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            endpointId: "made-up-id",
        };

        expect(() => new DeleteEndpointTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
