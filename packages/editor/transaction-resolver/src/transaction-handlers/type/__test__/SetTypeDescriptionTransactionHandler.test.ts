import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockApi } from "../../../testing-utils/mocks/MockApi";

describe("SetTypeDescriptionTransactionHandler", () => {
    it("correctly sets description", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeDescription({
            typeId: first.typeId,
            description: "New description",
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.description).toEqual("New description");
    });

    it("correctly sets undefined description", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeDescription({
            typeId: first.typeId,
            description: undefined,
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.description).toBeUndefined();
    });

    it("correctly sets zero-length description to undefined", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        const first = package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeDescription({
            typeId: first.typeId,
            description: "",
        });
        api.applyTransaction(transaction);

        expect(api.definition.types[first.typeId]?.description).toBeUndefined();
    });

    it("throws when type does not exist", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const transaction = TransactionGenerator.setTypeDescription({
            typeId: "made-up-id" as FernApiEditor.TypeId,
            description: "New type name",
        });

        expect(() => api.applyTransaction(transaction)).toThrow();
    });
});
