import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { generateEndpointId } from "../../../testing-utils/ids";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { CreateEndpointTransactionHandler } from "../CreateEndpointTransactionHandler";

describe("CreateEndpointTransactionHandler", () => {
    it("correctly adds endpoint", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addEndpoint();
        package_.addEndpoint();

        const endpointId = generateEndpointId();

        const transaction: FernApiEditor.transactions.CreateEndpointTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            endpointId,
            endpointName: "My new endpoint",
        };

        new CreateEndpointTransactionHandler().applyTransaction(api, transaction);

        const expectedNewEndpoint: FernApiEditor.Endpoint = {
            endpointId,
            endpointName: "My new endpoint",
        };

        expect(package_.endpoints[2]).toEqual(expectedNewEndpoint);
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();

        const transaction: FernApiEditor.transactions.CreateEndpointTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            endpointId: generateEndpointId(),
            endpointName: "My new endpoint",
        };

        expect(() => new CreateEndpointTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
