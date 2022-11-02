import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractCreateTransactionHander } from "../AbstractCreateTransactionHander";

export class CreatePackageTransactionHandler extends AbstractCreateTransactionHander<FernApiEditor.transactions.CreatePackageTransaction> {
    protected addToDefinition(transaction: FernApiEditor.transactions.CreatePackageTransaction): void {
        this.definition.packages[transaction.packageId] = {
            packageId: transaction.packageId,
            packageName: transaction.packageName,
            packages: [],
            endpoints: [],
            types: [],
            errors: [],
        };
    }

    protected addToParent(transaction: FernApiEditor.transactions.CreatePackageTransaction): void {
        if (transaction.parent != null) {
            const parent = this.getPackageOrThrow(transaction.parent);
            parent.packages.push(transaction.packageId);
        } else {
            this.definition.rootPackages.push(transaction.packageId);
        }
    }

    protected addToGraph(transaction: FernApiEditor.transactions.CreatePackageTransaction): void {
        this.graph.createPackage(transaction.packageId, { parent: transaction.parent });
    }
}
