import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractObjectTransactionHander } from "./AbstractObjectTransactionHander";

export class SetObjectExtensionTypeTransactionHandler extends AbstractObjectTransactionHander<FernApiEditor.transactions.SetObjectExtensionTypeTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.SetObjectExtensionTypeTransaction): void {
        const extension = this.getObjectExtensionOrThrow(transaction.objectId, transaction.extensionId);
        extension.extensionOf = this.getTypeOrThrow(transaction.extensionOf).typeId;
    }
}
