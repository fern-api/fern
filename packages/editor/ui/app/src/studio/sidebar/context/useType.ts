import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { DraftSidebarItemId } from "./SidebarContext";
import { useDraftableItem } from "./useDraftableItem";

export function useType(typeId: FernApiEditor.TypeId): FernApiEditor.Type {
    const retrieveFromDefinition = useCallback((definition: FernApiEditor.Api) => definition.types[typeId], [typeId]);

    const convertFromDraft = useCallback(
        (draft: DraftSidebarItemId): FernApiEditor.Type | undefined => {
            if (draft.type === "type" && draft.typeId === typeId) {
                return {
                    typeId,
                    typeName: "",
                };
            } else {
                return undefined;
            }
        },
        [typeId]
    );

    return useDraftableItem({
        definitionId: typeId,
        retrieveFromDefinition,
        convertFromDraft,
    });
}
