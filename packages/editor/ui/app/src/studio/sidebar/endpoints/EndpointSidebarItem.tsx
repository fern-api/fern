import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { useEndpoint } from "../context/useEndpoint";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { EditableSidebarItemRow } from "../row/editable-row/EditableSidebarItemRow";
import { useEditableSidebarItem } from "../shared/useEditableSidebarItem";
import { EndpointSidebarItemIcon } from "./EndpointSidebarItemIcon";

export declare namespace EndpointSidebarItem {
    export interface Props {
        endpointId: FernApiEditor.EndpointId;
        parent: FernApiEditor.PackageId;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpointId, parent }) => {
    const endpoint = useEndpoint(endpointId);

    const { onDelete, onRename, isDraft } = useEditableSidebarItem({
        definitionId: endpointId,
        parent,
        constructCreateTransaction,
        constructRenameTransaction,
        constructDeleteTransaction,
        isEqualToDraft,
    });

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.endpoint(endpoint), [endpoint]);

    return (
        <EditableSidebarItemRow
            itemId={sidebarItemId}
            label={endpoint.isDraft ? "" : endpoint.endpointName}
            icon={<EndpointSidebarItemIcon />}
            onDelete={onDelete}
            onRename={onRename}
            isDraft={isDraft}
            placeholder="Untitled endpoint"
        />
    );
};

function constructCreateTransaction({
    name: endpointName,
    parent,
    definitionId: endpointId,
}: useEditableSidebarItem.constructCreateTransaction.Args<FernApiEditor.EndpointId>): FernApiEditor.transactions.Transaction.CreateEndpoint {
    return TransactionGenerator.createEndpoint({
        endpointId,
        endpointName,
        parent,
    });
}

function constructRenameTransaction({
    newName: newEndpointName,
    definitionId: endpointId,
}: useEditableSidebarItem.constructRenameTransaction.Args<FernApiEditor.EndpointId>): FernApiEditor.transactions.Transaction.RenameEndpoint {
    return TransactionGenerator.renameEndpoint({
        endpointId,
        newEndpointName,
    });
}

function constructDeleteTransaction({
    definitionId: endpointId,
}: useEditableSidebarItem.constructDeleteTransaction.Args<FernApiEditor.EndpointId>): FernApiEditor.transactions.Transaction.DeleteEndpoint {
    return TransactionGenerator.deleteEndpoint({
        endpointId,
    });
}

function isEqualToDraft({
    definitionId: endpointId,
    draft,
}: useEditableSidebarItem.isEqualToDraft.Args<FernApiEditor.EndpointId>): boolean {
    return draft.type === "endpoint" && draft.endpointId === endpointId;
}
