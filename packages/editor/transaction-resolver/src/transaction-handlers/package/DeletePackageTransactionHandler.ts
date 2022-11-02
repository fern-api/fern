import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { AbstractDeleteTransactionHander } from "../AbstractDeleteTransactionHander";

export class DeletePackageTransactionHandler extends AbstractDeleteTransactionHander<FernApiEditor.transactions.DeletePackageTransaction> {
    protected removeDefinition(transaction: FernApiEditor.transactions.DeletePackageTransaction): void {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.definition.packages[transaction.packageId];
    }

    protected removeFromParent(transaction: FernApiEditor.transactions.DeletePackageTransaction): void {
        const parentId = this.graph.getPackageParent(transaction.packageId);
        if (parentId != null) {
            const parent = this.getPackageOrThrow(parentId);
            this.deletePackageFromList(transaction.packageId, parent.packages);
        } else {
            this.deletePackageFromList(transaction.packageId, this.definition.rootPackages);
        }
    }

    private deletePackageFromList(packageToDelete: FernApiEditor.PackageId, packages: FernApiEditor.PackageId[]) {
        const indexOfPackage = packages.indexOf(packageToDelete);
        if (indexOfPackage === -1) {
            throw new Error(`Package ${packageToDelete} does not exist in parent`);
        }
        packages.splice(indexOfPackage, 1);
    }

    protected removeFromGraph(transaction: FernApiEditor.transactions.DeletePackageTransaction): void {
        this.graph.deletePackage(transaction.packageId);
    }
}
