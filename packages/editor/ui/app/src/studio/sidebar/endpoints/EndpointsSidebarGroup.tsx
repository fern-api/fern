import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { EndpointId } from "@fern-fern/api-editor-sdk/resources";
import React, { useCallback } from "react";
import { DraftEndpointSidebarItemId, DraftSidebarItemId } from "../context/SidebarContext";
import { SidebarItemsList } from "../shared/SidebarItemsList";
import { EndpointSidebarItem } from "./EndpointSidebarItem";

export declare namespace EndpointsSidebarGroup {
    export interface Props {
        package_: FernApiEditor.Package;
    }
}

export const EndpointsSidebarGroup: React.FC<EndpointsSidebarGroup.Props> = ({ package_ }) => {
    const renderEndpointSidebarItem = useCallback(
        (endpointId: EndpointId) => (
            <EndpointSidebarItem key={endpointId} endpointId={endpointId} parent={package_.packageId} />
        ),
        [package_.packageId]
    );

    const isDraftInPackage = useCallback(
        (draft: DraftEndpointSidebarItemId) => {
            return draft.parent === package_.packageId;
        },
        [package_.packageId]
    );

    return (
        <SidebarItemsList
            items={package_.endpoints}
            renderItem={renderEndpointSidebarItem}
            convertDraftToItem={getEndpointIdFromDraft}
            doesDraftBelongInList={isDraftInPackage}
            parseDraftId={parseEndpointDraft}
        />
    );
};

function parseEndpointDraft(draft: DraftSidebarItemId): DraftEndpointSidebarItemId | undefined {
    if (draft.type === "endpoint") {
        return draft;
    }
    return undefined;
}

function getEndpointIdFromDraft(draft: DraftEndpointSidebarItemId): FernApiEditor.EndpointId {
    return draft.endpointId;
}
