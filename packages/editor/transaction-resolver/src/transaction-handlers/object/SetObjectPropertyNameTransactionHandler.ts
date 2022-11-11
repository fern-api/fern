import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractObjectTransactionHander } from "./AbstractObjectTransactionHander";

export class SetObjectPropertyNameTransactionHandler extends AbstractObjectTransactionHander<FernApiEditor.transactions.SetObjectPropertyNameTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.SetObjectPropertyNameTransaction): void {
        const property = this.getObjectPropertyOrThrow(transaction.objectId, transaction.propertyId);
        property.propertyName = transaction.newPropertyName;
    }
}
