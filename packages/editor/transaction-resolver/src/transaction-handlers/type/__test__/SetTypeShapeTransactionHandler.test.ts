import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("SetTypeShapeTransactionHandler", () => {
    it("correctly sets alias type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const shape = FernApiEditor.Shape.alias({
            aliasOf: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
        });

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(shape);
    });

    it("correctly sets object type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const shape = FernApiEditor.Shape.object({});

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(shape);
    });

    it("correctly sets union type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const shape = FernApiEditor.Shape.union({});

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(shape);
    });

    it("correctly sets enum type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const shape = FernApiEditor.Shape.enum({});

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(shape);
    });

    it("throws when type does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeShape({
            typeId: "made-up-id",
            shape: FernApiEditor.Shape.enum({}),
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
