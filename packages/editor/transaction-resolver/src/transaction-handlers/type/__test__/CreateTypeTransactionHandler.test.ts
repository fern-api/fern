import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("CreateTypeTransactionHandler", () => {
    it("correctly adds type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const typeId = EditorItemIdGenerator.type();

        const shape = FernApiEditor.Shape.alias({
            aliasOf: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
        });

        const transaction = TransactionGenerator.createType({
            parent: package_.packageId,
            typeId,
            typeName: "My new type",
            shape,
        });
        api.applyTransaction(transaction);

        const expectedNewType: FernApiEditor.Type = {
            typeId,
            typeName: "My new type",
            shape,
        };

        expect(api.definition.types[typeId]).toEqual(expectedNewType);
    });

    it("throws when parent does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();

        const transaction = TransactionGenerator.createType({
            parent: "made-up-id" as FernApiEditor.PackageId,
            typeId: EditorItemIdGenerator.type(),
            typeName: "My new type",
            shape: FernApiEditor.Shape.alias({
                aliasOf: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
            }),
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
