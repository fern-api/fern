import { Api } from "@fern-fern/api-editor-sdk/resources";
import { Transaction } from "@fern-fern/api-editor-sdk/resources/transactions";
import { ReorderPackagesTransactionHandler } from "./transaction-handlers/api/ReorderPackagesTransactionHandler";
import { CreateEndpointTransactionHandler } from "./transaction-handlers/endpoint/CreateEndpointTransactionHandler";
import { DeleteEndpointTransactionHandler } from "./transaction-handlers/endpoint/DeleteEndpointTransactionHandler";
import { RenameEndpointTransactionHandler } from "./transaction-handlers/endpoint/RenameEndpointTransactionHandler";
import { CreateErrorTransactionHandler } from "./transaction-handlers/error/CreateErrorTransactionHandler";
import { DeleteErrorTransactionHandler } from "./transaction-handlers/error/DeleteErrorTransactionHandler";
import { RenameErrorTransactionHandler } from "./transaction-handlers/error/RenameErrorTransactionHandler";
import { CreatePackageTransactionHandler } from "./transaction-handlers/package/CreatePackageTransactionHandler";
import { DeletePackageTransactionHandler } from "./transaction-handlers/package/DeletePackageTransactionHandler";
import { RenamePackageTransactionHandler } from "./transaction-handlers/package/RenamePackageTransactionHandler";
import { ReorderEndpointsTransactionHandler } from "./transaction-handlers/package/ReorderEndpointsTransactionHandler";
import { ReorderErrorsTransactionHandler } from "./transaction-handlers/package/ReorderErrorsTransactionHandler";
import { ReorderTypesTransactionHandler } from "./transaction-handlers/package/ReorderTypesTransactionHandler";
import { CreateTypeTransactionHandler } from "./transaction-handlers/type/CreateTypeTransactionHandler";
import { DeleteTypeTransactionHandler } from "./transaction-handlers/type/DeleteTypeTransactionHandler";
import { RenameTypeTransactionHandler } from "./transaction-handlers/type/RenameTypeTransactionHandler";

export class TransactionHandler {
    private reorderPackagesTransactionHandler: ReorderPackagesTransactionHandler;
    private createPackageTransactionHandler: CreatePackageTransactionHandler;
    private renamePackageTransactionHandler: RenamePackageTransactionHandler;
    private deletePackageTransactionHandler: DeletePackageTransactionHandler;
    private reorderEndpointsTransactionHandler: ReorderEndpointsTransactionHandler;
    private reorderTypesTransactionHandler: ReorderTypesTransactionHandler;
    private reorderErrorsTransactionHandler: ReorderErrorsTransactionHandler;
    private createEndpointTransactionHandler: CreateEndpointTransactionHandler;
    private renameEndpointTransactionHandler: RenameEndpointTransactionHandler;
    private deleteEndpointTransactionHandler: DeleteEndpointTransactionHandler;
    private createTypeTransactionHandler: CreateTypeTransactionHandler;
    private renameTypeTransactionHandler: RenameTypeTransactionHandler;
    private deleteTypeTransactionHandler: DeleteTypeTransactionHandler;
    private createErrorTransactionHandler: CreateErrorTransactionHandler;
    private renameErrorTransactionHandler: RenameErrorTransactionHandler;
    private deleteErrorTransactionHandler: DeleteErrorTransactionHandler;

    constructor() {
        this.reorderPackagesTransactionHandler = new ReorderPackagesTransactionHandler();
        this.createPackageTransactionHandler = new CreatePackageTransactionHandler();
        this.renamePackageTransactionHandler = new RenamePackageTransactionHandler();
        this.deletePackageTransactionHandler = new DeletePackageTransactionHandler();
        this.reorderEndpointsTransactionHandler = new ReorderEndpointsTransactionHandler();
        this.reorderTypesTransactionHandler = new ReorderTypesTransactionHandler();
        this.reorderErrorsTransactionHandler = new ReorderErrorsTransactionHandler();
        this.createEndpointTransactionHandler = new CreateEndpointTransactionHandler();
        this.renameEndpointTransactionHandler = new RenameEndpointTransactionHandler();
        this.deleteEndpointTransactionHandler = new DeleteEndpointTransactionHandler();
        this.createTypeTransactionHandler = new CreateTypeTransactionHandler();
        this.renameTypeTransactionHandler = new RenameTypeTransactionHandler();
        this.deleteTypeTransactionHandler = new DeleteTypeTransactionHandler();
        this.createErrorTransactionHandler = new CreateErrorTransactionHandler();
        this.renameErrorTransactionHandler = new RenameErrorTransactionHandler();
        this.deleteErrorTransactionHandler = new DeleteErrorTransactionHandler();
    }

    public applyTransaction(api: Api, transaction: Transaction): void {
        transaction._visit({
            reorderPackages: (t) => this.reorderPackagesTransactionHandler.applyTransaction(api, t),
            createPackage: (t) => this.createPackageTransactionHandler.applyTransaction(api, t),
            renamePackage: (t) => this.renamePackageTransactionHandler.applyTransaction(api, t),
            deletePackage: (t) => this.deletePackageTransactionHandler.applyTransaction(api, t),
            reorderEndpoints: (t) => this.reorderEndpointsTransactionHandler.applyTransaction(api, t),
            reorderTypes: (t) => this.reorderTypesTransactionHandler.applyTransaction(api, t),
            reorderErrors: (t) => this.reorderErrorsTransactionHandler.applyTransaction(api, t),
            createEndpoint: (t) => this.createEndpointTransactionHandler.applyTransaction(api, t),
            renameEndpoint: (t) => this.renameEndpointTransactionHandler.applyTransaction(api, t),
            deleteEndpoint: (t) => this.deleteEndpointTransactionHandler.applyTransaction(api, t),
            createType: (t) => this.createTypeTransactionHandler.applyTransaction(api, t),
            renameType: (t) => this.renameTypeTransactionHandler.applyTransaction(api, t),
            deleteType: (t) => this.deleteTypeTransactionHandler.applyTransaction(api, t),
            createError: (t) => this.createErrorTransactionHandler.applyTransaction(api, t),
            renameError: (t) => this.renameErrorTransactionHandler.applyTransaction(api, t),
            deleteError: (t) => this.deleteErrorTransactionHandler.applyTransaction(api, t),
            _other: ({ type }) => {
                throw new Error("Unknown transaction type: " + type);
            },
        });
    }
}
