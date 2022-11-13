import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useEditableSidebarItemCallbacks } from "../../../shared/sidebar/useEditableSidebarItemCallbacks";

export declare namespace useEditEndpointCallbacks {
    export interface Args {
        endpointId: FernApiEditor.EndpointId;
        parent: FernApiEditor.PackageId;
    }
}

export function useEditEndpointCallbacks({
    endpointId,
    parent,
}: useEditEndpointCallbacks.Args): useEditableSidebarItemCallbacks.Return {
    return useEditableSidebarItemCallbacks({
        definitionId: endpointId,
        parent,
        constructCreateTransaction,
        constructRenameTransaction,
        constructDeleteTransaction,
        isEqualToDraft,
    });
}

function constructCreateTransaction({
    name: endpointName,
    parent,
    definitionId: endpointId,
}: useEditableSidebarItemCallbacks.constructCreateTransaction.Args<FernApiEditor.EndpointId>): FernApiEditor.transactions.Transaction.CreateEndpoint {
    return TransactionGenerator.createEndpoint({
        endpointId,
        endpointName,
        parent,
    });
}

function constructRenameTransaction({
    newName: newEndpointName,
    definitionId: endpointId,
}: useEditableSidebarItemCallbacks.constructRenameTransaction.Args<FernApiEditor.EndpointId>): FernApiEditor.transactions.Transaction.RenameEndpoint {
    return TransactionGenerator.renameEndpoint({
        endpointId,
        newEndpointName,
    });
}

function constructDeleteTransaction({
    definitionId: endpointId,
}: useEditableSidebarItemCallbacks.constructDeleteTransaction.Args<FernApiEditor.EndpointId>): FernApiEditor.transactions.Transaction.DeleteEndpoint {
    return TransactionGenerator.deleteEndpoint({
        endpointId,
    });
}

function isEqualToDraft({
    definitionId: endpointId,
    draft,
}: useEditableSidebarItemCallbacks.isEqualToDraft.Args<FernApiEditor.EndpointId>): boolean {
    return draft.type === "endpoint" && draft.endpointId === endpointId;
}
