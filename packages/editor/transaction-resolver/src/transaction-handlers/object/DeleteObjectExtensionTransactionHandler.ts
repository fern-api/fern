import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractObjectTransactionHander } from "./AbstractObjectTransactionHander";

export class DeleteObjectExtensionTransactionHandler extends AbstractObjectTransactionHander<FernApiEditor.transactions.DeleteObjectExtensionTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.DeleteObjectExtensionTransaction): void {
        const object = this.getObjectOrThrow(transaction.objectId);
        const indexOfExtension = object.extensions.findIndex(
            (extension) => extension.extensionId === transaction.extensionId
        );
        if (indexOfExtension === -1) {
            throw new Error(`Extension ${transaction.extensionId} does not exist`);
        }
        object.extensions.splice(indexOfExtension, 1);
    }
}
