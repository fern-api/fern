import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { MaybeDraftEndpoint } from "../../../../sidebar/drafts/DraftableItem";
import { DraftEndpointSidebarItemId, DraftSidebarItemId } from "../../../../sidebar/drafts/DraftSidebarItemId";
import { useMaybeDraft } from "../../../shared/useMaybeDraft";

export function useMaybeDraftEndpoint(endpointId: FernApiEditor.EndpointId): MaybeDraftEndpoint {
    const retrieveFromDefinition = useCallback(
        (definition: FernApiEditor.Api) => definition.endpoints[endpointId],
        [endpointId]
    );
    return useMaybeDraft({
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
}: useMaybeDraft.isDraftForItem.Args<FernApiEditor.EndpointId, DraftEndpointSidebarItemId>): boolean {
    return draft.endpointId === endpointId;
}
