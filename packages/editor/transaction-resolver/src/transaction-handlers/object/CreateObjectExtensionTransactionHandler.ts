import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractObjectTransactionHander } from "./AbstractObjectTransactionHander";

export class CreateObjectExtensionTransactionHandler extends AbstractObjectTransactionHander<FernApiEditor.transactions.CreateObjectExtensionTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.CreateObjectExtensionTransaction): void {
        const object = this.getObjectOrThrow(transaction.objectId);
        object.extensions.push({
            extensionId: transaction.extensionId,
            extensionOf: this.getTypeOrThrow(transaction.extensionOf).typeId,
        });
    }
}
