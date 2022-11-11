import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractObjectTransactionHander } from "./AbstractObjectTransactionHander";

export class CreateObjectPropertyTransactionHandler extends AbstractObjectTransactionHander<FernApiEditor.transactions.CreateObjectPropertyTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.CreateObjectPropertyTransaction): void {
        const object = this.getObjectOrThrow(transaction.objectId);
        object.properties.push({
            propertyId: transaction.propertyId,
            propertyName: transaction.propertyName,
            propertyType: transaction.propertyType,
        });
    }
}
