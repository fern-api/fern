import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractObjectTransactionHander } from "./AbstractObjectTransactionHander";

export class SetObjectPropertyDescriptionTransactionHandler extends AbstractObjectTransactionHander<FernApiEditor.transactions.SetObjectPropertyDescriptionTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.SetObjectPropertyDescriptionTransaction): void {
        const property = this.getObjectPropertyOrThrow(transaction.objectId, transaction.propertyId);
        property.description =
            transaction.newPropertyDescription != null && transaction.newPropertyDescription.length > 0
                ? transaction.newPropertyDescription
                : undefined;
    }
}
