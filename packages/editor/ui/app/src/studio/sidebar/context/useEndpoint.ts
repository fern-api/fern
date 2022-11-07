import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { MaybeDraftEndpoint } from "../drafts/DraftableItem";
import { DraftEndpointSidebarItemId, DraftSidebarItemId } from "../drafts/DraftSidebarItemId";
import { useDraftableItem } from "./useDraftableItem";

export function useEndpoint(endpointId: FernApiEditor.EndpointId): MaybeDraftEndpoint {
    const retrieveFromDefinition = useCallback(
        (definition: FernApiEditor.Api) => definition.endpoints[endpointId],
        [endpointId]
    );
    return useDraftableItem({
        definitionId: endpointId,
        retrieveFromDefinition,
        narrowDraft,
        isDraftForItem,
    });
}

function narrowDraft(draft: DraftSidebarItemId): DraftEndpointSidebarItemId | undefined {
    if (draft.type === "endpoint") {
        return draft;
    }
    return undefined;
}

function isDraftForItem({
    definitionId: endpointId,
    draft,
}: useDraftableItem.isDraftForItem.Args<FernApiEditor.EndpointId, DraftEndpointSidebarItemId>): boolean {
    return draft.endpointId === endpointId;
}
