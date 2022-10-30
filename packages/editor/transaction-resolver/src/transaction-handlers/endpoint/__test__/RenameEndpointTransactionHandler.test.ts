import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { RenameEndpointTransactionHandler } from "../RenameEndpointTransactionHandler";

describe("RenameEndpointTransactionHandler", () => {
    it("correctly renames endpoint", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        package_.addEndpoint();

        const transaction: FernApiEditor.transactions.RenameEndpointTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            endpointId: first.endpointId,
            newEndpointName: "New endpoint name",
        };

        new RenameEndpointTransactionHandler().applyTransaction(api, transaction);

        expect(package_.endpoints[0]?.endpointName).toEqual("New endpoint name");
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addEndpoint();
        package_.addEndpoint();

        const transaction: FernApiEditor.transactions.RenameEndpointTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            endpointId: first.endpointId,
            newEndpointName: "New endpoint name",
        };

        expect(() => new RenameEndpointTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });

    it("throws when endpoint does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addEndpoint();
        package_.addEndpoint();

        const transaction: FernApiEditor.transactions.RenameEndpointTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            endpointId: "made-up-id",
            newEndpointName: "New endpoint name",
        };

        expect(() => new RenameEndpointTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
