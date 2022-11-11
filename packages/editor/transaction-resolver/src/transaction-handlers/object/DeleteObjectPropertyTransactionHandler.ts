import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractObjectTransactionHander } from "./AbstractObjectTransactionHander";

export class DeleteObjectPropertyTransactionHandler extends AbstractObjectTransactionHander<FernApiEditor.transactions.DeleteObjectPropertyTransaction> {
    public applyTransaction(transaction: FernApiEditor.transactions.DeleteObjectPropertyTransaction): void {
        const object = this.getObjectOrThrow(transaction.objectId);
        const indexOfProperty = object.properties.findIndex(
            (property) => property.propertyId === transaction.propertyId
        );
        if (indexOfProperty === -1) {
            throw new Error(`Property ${transaction.propertyId} does not exist`);
        }
        object.properties.splice(indexOfProperty, 1);
    }
}
