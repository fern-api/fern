import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("DeleteObjectExtensionTransactionHandler", () => {
    it("correctly deletes extension", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addObject();
        const second = package_.addObject();

        const extensionId = EditorItemIdGenerator.objectExtension();
        api.applyTransaction(
            TransactionGenerator.createObjectExtension({
                objectId: second.typeId,
                extensionId,
                extensionOf: first.typeId,
            })
        );

        const transaction = TransactionGenerator.deleteObjectExtension({
            objectId: second.typeId,
            extensionId,
        });
        api.applyTransaction(transaction);

        const object = api.definition.types[second.typeId];
        if (object?.shape.type !== "object") {
            throw new Error("Type is not an object");
        }
        expect(object.shape.extensions).toHaveLength(0);
    });

    it("throws when object does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addObject();
        const second = package_.addObject();

        const extensionId = EditorItemIdGenerator.objectExtension();
        api.applyTransaction(
            TransactionGenerator.createObjectExtension({
                objectId: second.typeId,
                extensionId,
                extensionOf: first.typeId,
            })
        );
        const transaction = TransactionGenerator.deleteObjectExtension({
            objectId: "made-up-id" as FernApiEditor.TypeId,
            extensionId,
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when extension does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addObject();
        const second = package_.addObject();

        const transaction = TransactionGenerator.deleteObjectExtension({
            objectId: second.typeId,
            extensionId: "made-up-id" as FernApiEditor.ObjectExtensionId,
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
