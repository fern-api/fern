import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractDeleteTransactionHander } from "../AbstractDeleteTransactionHander";

export class DeleteEndpointTransactionHandler extends AbstractDeleteTransactionHander<FernApiEditor.transactions.DeleteEndpointTransaction> {
    protected removeDefinition(transaction: FernApiEditor.transactions.DeleteEndpointTransaction): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.definition.endpoints[transaction.endpointId];
    }

    protected removeFromParent(transaction: FernApiEditor.transactions.DeleteEndpointTransaction): void {
        const parentId = this.graph.getEndpointParent(transaction.endpointId);
        const parent = this.getPackageOrThrow(parentId);
        const indexOfEndpoint = parent.endpoints.indexOf(transaction.endpointId);
        if (indexOfEndpoint === -1) {
            throw new Error(`Endpoint ${transaction.endpointId} does not exist in parent ${parentId}`);
        }
        parent.endpoints.splice(indexOfEndpoint, 1);
    }

    protected removeFromGraph(transaction: FernApiEditor.transactions.DeleteEndpointTransaction): void {
        this.graph.deleteEndpoint(transaction.endpointId);
    }
}
