import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("CreateObjectPropertyTransactionHandler", () => {
    it("correctly adds property", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addObject();
        const second = package_.addObject();

        const propertyId = EditorItemIdGenerator.objectProperty();

        const transaction = TransactionGenerator.createObjectProperty({
            objectId: second.typeId,
            propertyId,
            propertyName: "My property",
            propertyType: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
        });
        api.applyTransaction(transaction);

        const expectedNewProperty: FernApiEditor.ObjectProperty = {
            propertyId,
            propertyName: "My property",
            propertyType: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
        };

        const object = api.definition.types[second.typeId];
        if (object?.shape.type !== "object") {
            throw new Error("Type is not an object");
        }
        expect(object.shape.properties).toEqual([expectedNewProperty]);
    });

    it("throws when object does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addObject();

        const propertyId = EditorItemIdGenerator.objectProperty();

        const transaction = TransactionGenerator.createObjectProperty({
            objectId: "made-up-id" as FernApiEditor.TypeId,
            propertyId,
            propertyName: "My property",
            propertyType: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
