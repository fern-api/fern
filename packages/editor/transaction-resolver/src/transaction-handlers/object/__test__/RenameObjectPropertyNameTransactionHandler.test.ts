import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("RenameObjectPropertyTransactionHandler", () => {
    it("correctly sets property name", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        const second = package_.addType({
            shape: FernApiEditor.Shape.object({
                properties: [],
            }),
        });

        const propertyId = EditorItemIdGenerator.objectProperty();
        api.applyTransaction(
            TransactionGenerator.createObjectProperty({
                objectId: second.typeId,
                propertyId,
                propertyName: "My property",
                propertyType: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
            })
        );
        const transaction = TransactionGenerator.renameObjectProperty({
            objectId: second.typeId,
            propertyId,
            newPropertyName: "New property name",
        });
        api.applyTransaction(transaction);

        const object = api.definition.types[second.typeId];
        if (object?.shape.type !== "object") {
            throw new Error("Type is not an object");
        }
        expect(object.shape.properties[0]?.propertyName).toEqual("New property name");
    });

    it("throws when object does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        const second = package_.addType({
            shape: FernApiEditor.Shape.object({
                properties: [],
            }),
        });

        const propertyId = EditorItemIdGenerator.objectProperty();
        api.applyTransaction(
            TransactionGenerator.createObjectProperty({
                objectId: second.typeId,
                propertyId,
                propertyName: "My property",
                propertyType: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
            })
        );
        const transaction = TransactionGenerator.renameObjectProperty({
            objectId: "made-up-id",
            propertyId,
            newPropertyName: "My property",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when property does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        const second = package_.addType();

        const transaction = TransactionGenerator.renameObjectProperty({
            objectId: second.typeId,
            propertyId: "made-up-id",
            newPropertyName: "My property",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
