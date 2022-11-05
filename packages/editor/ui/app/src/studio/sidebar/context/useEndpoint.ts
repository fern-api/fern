import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { DraftSidebarItemId } from "./SidebarContext";
import { useDraftableItem } from "./useDraftableItem";

export function useEndpoint(endpointId: FernApiEditor.EndpointId): FernApiEditor.Endpoint {
    const retrieveFromDefinition = useCallback(
        (definition: FernApiEditor.Api) => definition.endpoints[endpointId],
        [endpointId]
    );

    const convertFromDraft = useCallback(
        (draft: DraftSidebarItemId): FernApiEditor.Endpoint | undefined => {
            if (draft.type === "endpoint" && draft.endpointId === endpointId) {
                return {
                    endpointId,
                    endpointName: "",
                };
            } else {
                return undefined;
            }
        },
        [endpointId]
    );

    return useDraftableItem({
        definitionId: endpointId,
        retrieveFromDefinition,
        convertFromDraft,
    });
}
