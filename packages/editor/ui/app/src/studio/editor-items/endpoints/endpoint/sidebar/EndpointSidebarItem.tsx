import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { SidebarItemIdGenerator } from "../../../../sidebar/ids/SidebarItemIdGenerator";
import { EditableSidebarItemRow } from "../../../../sidebar/row/editable-row/EditableSidebarItemRow";
import { EndpointIcon } from "../EndpointIcon";
import { useEditEndpointCallbacks } from "./useEditEndpointCallbacks";
import { useMaybeDraftEndpoint } from "./useMaybeDraftEndpoint";

export declare namespace EndpointSidebarItem {
    export interface Props {
        endpointId: FernApiEditor.EndpointId;
        parent: FernApiEditor.PackageId;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpointId, parent }) => {
    const endpoint = useMaybeDraftEndpoint(endpointId);

    const { onDelete, onRename, isDraft } = useEditEndpointCallbacks({
        endpointId,
        parent,
    });

    const sidebarItemId = useMemo(() => SidebarItemIdGenerator.endpoint(endpoint), [endpoint]);

    return (
        <EditableSidebarItemRow
            itemId={sidebarItemId}
            label={endpoint.isDraft ? "" : endpoint.endpointName}
            icon={<EndpointIcon />}
            onDelete={onDelete}
            onRename={onRename}
            isDraft={isDraft}
            placeholder="Untitled endpoint"
        />
    );
};
