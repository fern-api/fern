import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractCreateTransactionHander } from "../AbstractCreateTransactionHander";

export class CreateEndpointTransactionHandler extends AbstractCreateTransactionHander<FernApiEditor.transactions.CreateEndpointTransaction> {
    protected addToDefinition(transaction: FernApiEditor.transactions.CreateEndpointTransaction): void {
        this.definition.endpoints[transaction.endpointId] = {
            endpointId: transaction.endpointId,
            endpointName: transaction.endpointName,
        };
    }

    protected addToParent(transaction: FernApiEditor.transactions.CreateEndpointTransaction): void {
        const parent = this.getPackageOrThrow(transaction.parent);
        parent.endpoints.push(transaction.endpointId);
    }

    protected addToGraph(transaction: FernApiEditor.transactions.CreateEndpointTransaction): void {
        this.graph.createEndpoint(transaction.endpointId, { parent: transaction.parent });
    }
}
