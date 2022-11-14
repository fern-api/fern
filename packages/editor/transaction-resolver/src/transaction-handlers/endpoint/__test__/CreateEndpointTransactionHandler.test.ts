import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("CreateEndpointTransactionHandler", () => {
    it("correctly adds endpoint", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addEndpoint();
        package_.addEndpoint();

        const endpointId = EditorItemIdGenerator.endpoint();

        const transaction = TransactionGenerator.createEndpoint({
            parent: package_.packageId,
            endpointId,
            endpointName: "My new endpoint",
        });
        api.applyTransaction(transaction);

        const expectedNewEndpoint: FernApiEditor.Endpoint = {
            endpointId,
            endpointName: "My new endpoint",
        };

        expect(api.definition.endpoints[endpointId]).toEqual(expectedNewEndpoint);
    });

    it("throws when parent does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();

        const transaction = TransactionGenerator.createEndpoint({
            parent: "made-up-id" as FernApiEditor.PackageId,
            endpointId: EditorItemIdGenerator.endpoint(),
            endpointName: "My new endpoint",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
