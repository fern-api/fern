import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("DeleteObjectPropertyTransactionHandler", () => {
    it("correctly deletes property", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const second = package_.addType({
            shape: FernApiEditor.Shape.object({
                properties: [],
                extensions: [],
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

        const transaction = TransactionGenerator.deleteObjectProperty({
            objectId: second.typeId,
            propertyId,
        });
        api.applyTransaction(transaction);

        const object = api.definition.types[second.typeId];
        if (object?.shape.type !== "object") {
            throw new Error("Type is not an object");
        }
        expect(object.shape.properties).toHaveLength(0);
    });

    it("throws when object does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        const second = package_.addType({
            shape: FernApiEditor.Shape.object({
                properties: [],
                extensions: [],
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
        const transaction = TransactionGenerator.deleteObjectProperty({
            objectId: "made-up-id",
            propertyId,
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });

    it("throws when property does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        const second = package_.addType();

        const transaction = TransactionGenerator.deleteObjectProperty({
            objectId: second.typeId,
            propertyId: "made-up-id",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
