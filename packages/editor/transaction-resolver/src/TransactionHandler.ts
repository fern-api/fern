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
import { CreateObjectExtensionTransactionHandler } from "./transaction-handlers/object/CreateObjectExtensionTransactionHandler";
import { CreateObjectPropertyTransactionHandler } from "./transaction-handlers/object/CreateObjectPropertyTransactionHandler";
import { DeleteObjectExtensionTransactionHandler } from "./transaction-handlers/object/DeleteObjectExtensionTransactionHandler";
import { DeleteObjectPropertyTransactionHandler } from "./transaction-handlers/object/DeleteObjectPropertyTransactionHandler";
import { RenameObjectPropertyTransactionHandler } from "./transaction-handlers/object/RenameObjectPropertyTransactionHandler";
import { SetObjectExtensionTypeTransactionHandler } from "./transaction-handlers/object/SetObjectExtensionTypeTransactionHandler";
import { SetObjectPropertyDescriptionTransactionHandler } from "./transaction-handlers/object/SetObjectPropertyDescriptionTransactionHandler";
import { SetObjectPropertyTypeTransactionHandler } from "./transaction-handlers/object/SetObjectPropertyTypeTransactionHandler";
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
import { CreateUnionMemberTransactionHandler } from "./transaction-handlers/union/CreateUnionMemberTransactionHandler";
import { DeleteUnionMemberTransactionHandlerHandler } from "./transaction-handlers/union/DeleteUnionMemberTransactionHandler";
import { SetUnionDiscriminantTransactionHandler } from "./transaction-handlers/union/SetUnionDiscriminantTransactionHandler";
import { SetUnionMemberDiscriminantValueTransactionHandler } from "./transaction-handlers/union/SetUnionMemberDiscriminantValueTransactionHandler";

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
            createObjectExtension: (t) => {
                new CreateObjectExtensionTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            setObjectExtensionType: (t) => {
                new SetObjectExtensionTypeTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            deleteObjectExtension: (t) => {
                new DeleteObjectExtensionTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            createObjectProperty: (t) => {
                new CreateObjectPropertyTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            renameObjectProperty: (t) => {
                new RenameObjectPropertyTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            setObjectPropertyType: (t) => {
                new SetObjectPropertyTypeTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            setObjectPropertyDescription: (t) => {
                new SetObjectPropertyDescriptionTransactionHandler({ graph: this.graph, definition }).applyTransaction(
                    t
                );
            },
            deleteObjectProperty: (t) => {
                new DeleteObjectPropertyTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            setUnionDiscriminant: (t) => {
                new SetUnionDiscriminantTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            createUnionMember: (t) => {
                new CreateUnionMemberTransactionHandler({ graph: this.graph, definition }).applyTransaction(t);
            },
            setUnionMemberDiscriminantValue: (t) => {
                new SetUnionMemberDiscriminantValueTransactionHandler({
                    graph: this.graph,
                    definition,
                }).applyTransaction(t);
            },
            deleteUnionMember: (t) => {
                new DeleteUnionMemberTransactionHandlerHandler({ graph: this.graph, definition }).applyTransaction(t);
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
