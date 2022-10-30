import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { v4 as uuidv4 } from "uuid";

export function createBaseTransaction(): FernApiEditor.transactions.BaseTransaction {
    return {
        transactionId: uuidv4(),
        createdAt: new Date(),
    };
}
