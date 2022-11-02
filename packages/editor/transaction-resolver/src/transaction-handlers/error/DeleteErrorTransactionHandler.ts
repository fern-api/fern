import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractDeleteTransactionHander } from "../AbstractDeleteTransactionHander";

export class DeleteErrorTransactionHandler extends AbstractDeleteTransactionHander<FernApiEditor.transactions.DeleteErrorTransaction> {
    protected removeDefinition(transaction: FernApiEditor.transactions.DeleteErrorTransaction): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.definition.errors[transaction.errorId];
    }

    protected removeFromParent(transaction: FernApiEditor.transactions.DeleteErrorTransaction): void {
        const parentId = this.graph.getErrorParent(transaction.errorId);
        const parent = this.getPackageOrThrow(parentId);
        const indexOfError = parent.errors.indexOf(transaction.errorId);
        if (indexOfError === -1) {
            throw new Error(`Error ${transaction.errorId} does not exist in parent ${parentId}`);
        }
        parent.errors.splice(indexOfError, 1);
    }

    protected removeFromGraph(transaction: FernApiEditor.transactions.DeleteErrorTransaction): void {
        this.graph.deleteError(transaction.errorId);
    }
}
