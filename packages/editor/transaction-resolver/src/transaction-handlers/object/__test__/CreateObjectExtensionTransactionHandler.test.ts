import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("CreateObjectExtensionTransactionHandler", () => {
    it("correctly adds extension", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addObject();
        const second = package_.addObject();

        const extensionId = EditorItemIdGenerator.objectExtension();

        const transaction = TransactionGenerator.createObjectExtension({
            objectId: second.typeId,
            extensionId,
            extensionOf: first.typeId,
        });
        api.applyTransaction(transaction);

        const expectedNewExtension: FernApiEditor.ObjectExtension = {
            extensionId,
            extensionOf: first.typeId,
        };

        const object = api.definition.types[second.typeId];
        if (object?.shape.type !== "object") {
            throw new Error("Type is not an object");
        }
        expect(object.shape.extensions).toEqual([expectedNewExtension]);
    });

    it("throws when object does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addObject();

        const extensionId = EditorItemIdGenerator.objectExtension();

        const transaction = TransactionGenerator.createObjectExtension({
            objectId: "made-up-id" as FernApiEditor.TypeId,
            extensionId,
            extensionOf: first.typeId,
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when extensionOf does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addObject();

        const extensionId = EditorItemIdGenerator.objectExtension();

        const transaction = TransactionGenerator.createObjectExtension({
            objectId: first.typeId,
            extensionId,
            extensionOf: "made-up-id" as FernApiEditor.TypeId,
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
