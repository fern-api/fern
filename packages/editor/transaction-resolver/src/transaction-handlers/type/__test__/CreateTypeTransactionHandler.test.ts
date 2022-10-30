import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { generateTypeId } from "../../../testing-utils/ids";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { CreateTypeTransactionHandler } from "../CreateTypeTransactionHandler";

describe("CreateTypeTransactionHandler", () => {
    it("correctly adds type", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addType();
        package_.addType();

        const typeId = generateTypeId();

        const transaction: FernApiEditor.transactions.CreateTypeTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            typeId,
            typeName: "My new type",
        };

        new CreateTypeTransactionHandler().applyTransaction(api, transaction);

        const expectedNewType: FernApiEditor.Type = {
            typeId,
            typeName: "My new type",
        };

        expect(package_.types[2]).toEqual(expectedNewType);
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();

        const transaction: FernApiEditor.transactions.CreateTypeTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            typeId: generateTypeId(),
            typeName: "My new type",
        };

        expect(() => new CreateTypeTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
