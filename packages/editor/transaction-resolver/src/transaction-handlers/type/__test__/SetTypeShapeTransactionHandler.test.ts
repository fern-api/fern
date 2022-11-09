import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

const ALIAS_OF_STRING_SHAPE = FernApiEditor.Shape.alias({
    aliasOf: FernApiEditor.TypeReference.primitive(FernApiEditor.PrimitiveType.String),
});

describe("SetTypeDescriptionTransactionHandler", () => {
    it("correctly sets alias type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape: ALIAS_OF_STRING_SHAPE,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(ALIAS_OF_STRING_SHAPE);
    });

    it("correctly sets object type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape: ALIAS_OF_STRING_SHAPE,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(FernApiEditor.Shape.object({}));
    });

    it("correctly sets union type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape: ALIAS_OF_STRING_SHAPE,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(FernApiEditor.Shape.union({}));
    });

    it("correctly sets enum type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape: ALIAS_OF_STRING_SHAPE,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(FernApiEditor.Shape.enum({}));
    });

    it("throws when type does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeShape({
            typeId: "made-up-id",
            shape: ALIAS_OF_STRING_SHAPE,
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
