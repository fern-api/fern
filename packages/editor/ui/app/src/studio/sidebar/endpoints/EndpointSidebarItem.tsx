import { Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { useEndpoint } from "../context/useEndpoint";
import { SidebarItemIdGenerator } from "../ids/SidebarItemIdGenerator";
import { SidebarItemRow } from "../items/SidebarItemRow";

export declare namespace EndpointSidebarItem {
    export interface Props {
        endpointId: FernApiEditor.EndpointId;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpointId }) => {
    const { submitTransaction } = useApiEditorContext();
    const endpoint = useEndpoint(endpointId);

    const onClickDelete = useCallback(() => {
        submitTransaction(
            TransactionGenerator.deleteEndpoint({
                endpointId,
            })
        );
    }, [endpointId, submitTransaction]);

    const onRename = useCallback(
        (newEndpointName: string) => {
            submitTransaction(
                TransactionGenerator.renameEndpoint({
                    endpointId,
                    newEndpointName,
                })
            );
        },
        [endpointId, submitTransaction]
    );

    return (
        <SidebarItemRow
            itemId={SidebarItemIdGenerator.endpoint(endpointId)}
            icon={<Tag minimal intent={Intent.PRIMARY} icon={IconNames.EXCHANGE} />}
            label={endpoint.endpointName}
            onDelete={onClickDelete}
            onRename={onRename}
        />
    );
};
