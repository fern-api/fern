import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractCreateTransactionHander } from "../AbstractCreateTransactionHander";

export class CreateTypeTransactionHandler extends AbstractCreateTransactionHander<FernApiEditor.transactions.CreateTypeTransaction> {
    protected addToDefinition(transaction: FernApiEditor.transactions.CreateTypeTransaction): void {
        this.definition.types[transaction.typeId] = {
            typeId: transaction.typeId,
            typeName: transaction.typeName,
        };
    }

    protected addToParent(transaction: FernApiEditor.transactions.CreateTypeTransaction): void {
        const parent = this.getPackageOrThrow(transaction.parent);
        parent.types.push(transaction.typeId);
    }

    protected addToGraph(transaction: FernApiEditor.transactions.CreateTypeTransaction): void {
        this.graph.createType(transaction.typeId, { parent: transaction.parent });
    }
}
