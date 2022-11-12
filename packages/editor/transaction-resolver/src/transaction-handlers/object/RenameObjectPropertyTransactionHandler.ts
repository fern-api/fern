import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractObjectTransactionHander } from "./AbstractObjectTransactionHander";

export class RenameObjectPropertyTransactionHandler extends AbstractObjectTransactionHander<FernApiEditor.transactions.RenameObjectPropertyTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.RenameObjectPropertyTransaction): void {
        const property = this.getObjectPropertyOrThrow(transaction.objectId, transaction.propertyId);
        property.propertyName = transaction.newPropertyName;
    }
}
