import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractDeleteTransactionHander } from "../AbstractDeleteTransactionHander";

export class DeleteTypeTransactionHandler extends AbstractDeleteTransactionHander<FernApiEditor.transactions.DeleteTypeTransaction> {
    protected removeDefinition(transaction: FernApiEditor.transactions.DeleteTypeTransaction): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.definition.types[transaction.typeId];
    }

    protected removeFromParent(transaction: FernApiEditor.transactions.DeleteTypeTransaction): void {
        const parentId = this.graph.getTypeParent(transaction.typeId);
        const parent = this.getPackageOrThrow(parentId);
        const indexOfType = parent.types.indexOf(transaction.typeId);
        if (indexOfType === -1) {
            throw new Error(`Type ${transaction.typeId} does not exist in parent ${parentId}`);
        }
        parent.types.splice(indexOfType, 1);
    }

    protected removeFromGraph(transaction: FernApiEditor.transactions.DeleteTypeTransaction): void {
        this.graph.deleteType(transaction.typeId);
    }
}
