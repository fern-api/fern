import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("SetTypeDescriptionTransactionHandler", () => {
    it("correctly sets alias type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape: FernApiEditor.transactions.TypeShape.Alias,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(FernApiEditor.Shape.alias({}));
    });

    it("correctly sets object type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeShape({
            typeId: first.typeId,
            shape: FernApiEditor.transactions.TypeShape.Object,
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
            shape: FernApiEditor.transactions.TypeShape.Union,
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
            shape: FernApiEditor.transactions.TypeShape.Enum,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.shape).toEqual(FernApiEditor.Shape.enum({}));
    });

    it("throws when type does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeDescription({
            typeId: "made-up-id",
            description: "New type name",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
