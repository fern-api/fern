import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractObjectTransactionHander } from "./AbstractObjectTransactionHander";

export class SetObjectPropertyTypeTransactionHandler extends AbstractObjectTransactionHander<FernApiEditor.transactions.SetObjectPropertyTypeTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.SetObjectPropertyTypeTransaction): void {
        const property = this.getObjectPropertyOrThrow(transaction.objectId, transaction.propertyId);
        property.propertyType = transaction.newPropertyType;
    }
}
