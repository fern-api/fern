import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { MaybeDraftType } from "../drafts/DraftableItem";
import { DraftSidebarItemId, DraftTypeSidebarItemId } from "../drafts/DraftSidebarItemId";
import { useDraftableItem } from "./useDraftableItem";

export function useType(typeId: FernApiEditor.TypeId): MaybeDraftType {
    const retrieveFromDefinition = useCallback((definition: FernApiEditor.Api) => definition.types[typeId], [typeId]);
    return useDraftableItem({
        definitionId: typeId,
        retrieveFromDefinition,
        narrowDraft,
        isDraftForItem,
    });
}

function narrowDraft(draft: DraftSidebarItemId): DraftTypeSidebarItemId | undefined {
    if (draft.type === "type") {
        return draft;
    }
    return undefined;
}

function isDraftForItem({
    definitionId: typeId,
    draft,
}: useDraftableItem.isDraftForItem.Args<FernApiEditor.TypeId, DraftTypeSidebarItemId>): boolean {
    return draft.typeId === typeId;
}
