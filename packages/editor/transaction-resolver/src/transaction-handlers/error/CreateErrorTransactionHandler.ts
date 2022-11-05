import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractCreateTransactionHander } from "../AbstractCreateTransactionHander";

export class CreateErrorTransactionHandler extends AbstractCreateTransactionHander<FernApiEditor.transactions.CreateErrorTransaction> {
    protected addToDefinition(transaction: FernApiEditor.transactions.CreateErrorTransaction): void {
        this.definition.errors[transaction.errorId] = {
            errorId: transaction.errorId,
            errorName: transaction.errorName,
        };
    }

    protected addToParent(transaction: FernApiEditor.transactions.CreateErrorTransaction): void {
        const parent = this.getPackageOrThrow(transaction.parent);
        parent.errors.push(transaction.errorId);
    }

    protected addToGraph(transaction: FernApiEditor.transactions.CreateErrorTransaction): void {
        this.graph.createError(transaction.errorId, { parent: transaction.parent });
    }
}
