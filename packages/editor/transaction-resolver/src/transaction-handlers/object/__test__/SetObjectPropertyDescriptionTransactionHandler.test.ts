import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("SetObjectPropertyDescriptionTransactionHandler", () => {
    it("correctly sets property description", () => {
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

        const transaction = TransactionGenerator.setObjectPropertyDescription({
            objectId: second.typeId,
            propertyId,
            newPropertyDescription: "I'm a new description!",
        });
        api.applyTransaction(transaction);

        const object = api.definition.types[second.typeId];
        if (object?.shape.type !== "object") {
            throw new Error("Type is not an object");
        }
        expect(object.shape.properties[0]?.description).toEqual("I'm a new description!");
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
        const transaction = TransactionGenerator.setObjectPropertyDescription({
            objectId: "made-up-id",
            propertyId,
            newPropertyDescription: "I'm a new description!",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when property does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        const second = package_.addType({
            shape: FernApiEditor.Shape.object({
                properties: [],
            }),
        });

        const transaction = TransactionGenerator.setObjectPropertyDescription({
            objectId: second.typeId,
            propertyId: "made-up-id",
            newPropertyDescription: "I'm a new description!",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
