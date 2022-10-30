import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../../../testing-utils/createBaseTransaction";
import { generateErrorId } from "../../../testing-utils/ids";
import { MockApi } from "../../../testing-utils/mocks/MockApi";
import { CreateErrorTransactionHandler } from "../CreateErrorTransactionHandler";

describe("CreateErrorTransactionHandler", () => {
    it("correctly adds error", () => {
        const api = new MockApi();
        const package_ = api.addPackage();
        package_.addError();
        package_.addError();

        const errorId = generateErrorId();

        const transaction: FernApiEditor.transactions.CreateErrorTransaction = {
            ...createBaseTransaction(),
            packageId: package_.packageId,
            errorId,
            errorName: "My new error",
        };

        new CreateErrorTransactionHandler().applyTransaction(api, transaction);

        const expectedNewError: FernApiEditor.Error = {
            errorId,
            errorName: "My new error",
            statusCode: expect.any(String),
        };

        expect(package_.errors[2]).toEqual(expectedNewError);
    });

    it("throws when package does not exist", () => {
        const api = new MockApi();
        api.addPackage();
        api.addPackage();

        const transaction: FernApiEditor.transactions.CreateErrorTransaction = {
            ...createBaseTransaction(),
            packageId: "made-up-id",
            errorId: generateErrorId(),
            errorName: "My new error",
        };

        expect(() => new CreateErrorTransactionHandler().applyTransaction(api, transaction)).toThrow();
    });
});
