import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { Transaction } from "@fern-fern/api-editor-sdk/resources/transactions";
import { ApiGraph } from "./api-graph/ApiGraph";
import { ReorderRootPackagesTransactionHandler } from "./transaction-handlers/api/ReorderRootPackagesTransactionHandler";
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
import { ReorderPackagesTransactionHandler } from "./transaction-handlers/package/ReorderPackagesTransactionHandler";
import { ReorderTypesTransactionHandler } from "./transaction-handlers/package/ReorderTypesTransactionHandler";
import { CreateTypeTransactionHandler } from "./transaction-handlers/type/CreateTypeTransactionHandler";
import { DeleteTypeTransactionHandler } from "./transaction-handlers/type/DeleteTypeTransactionHandler";
import { RenameTypeTransactionHandler } from "./transaction-handlers/type/RenameTypeTransactionHandler";
import { SetTypeDescriptionTransactionHandler } from "./transaction-handlers/type/SetTypeDescriptionTransactionHandler";
import { SetTypeShapeTransactionHandler } from "./transaction-handlers/type/SetTypeShapeTransactionHandler";

export class TransactionHandler {
    public readonly graph: ApiGraph;

    constructor(initialDefinition: FernApiEditor.Api) {
        this.graph = new ApiGraph(initialDefinition);
    }

    public applyTransaction(definition: FernApiEditor.Api, transaction: Transaction): void {
        transaction._visit({
            reorderRootPackages: (t) => {
                new ReorderRootPackagesTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            createPackage: (t) => {
                new CreatePackageTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            renamePackage: (t) => {
                new RenamePackageTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            deletePackage: (t) => {
                new DeletePackageTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            reorderPackages: (t) => {
                new ReorderPackagesTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            reorderEndpoints: (t) => {
                new ReorderEndpointsTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            reorderTypes: (t) => {
                new ReorderTypesTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            reorderErrors: (t) => {
                new ReorderErrorsTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            createEndpoint: (t) => {
                new CreateEndpointTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            renameEndpoint: (t) => {
                new RenameEndpointTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            deleteEndpoint: (t) => {
                new DeleteEndpointTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            createType: (t) => {
                new CreateTypeTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            renameType: (t) => {
                new RenameTypeTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            setTypeDescription: (t) => {
                new SetTypeDescriptionTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            setTypeShape: (t) => {
                new SetTypeShapeTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            deleteType: (t) => {
                new DeleteTypeTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            createError: (t) => {
                new CreateErrorTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            renameError: (t) => {
                new RenameErrorTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            deleteError: (t) => {
                new DeleteErrorTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            _other: ({ type }) => {
                throw new Error("Unknown transaction type: " + type);
            },
        });
    }
}
