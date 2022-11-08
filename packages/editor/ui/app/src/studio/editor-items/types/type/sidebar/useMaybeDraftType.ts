import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { MaybeDraftType } from "../../../../sidebar/drafts/DraftableItem";
import { DraftSidebarItemId, DraftTypeSidebarItemId } from "../../../../sidebar/drafts/DraftSidebarItemId";
import { useMaybeDraft } from "../../../shared/useMaybeDraft";

export function useMaybeDraftType(typeId: FernApiEditor.TypeId): MaybeDraftType {
    const retrieveFromDefinition = useCallback((definition: FernApiEditor.Api) => definition.types[typeId], [typeId]);
    return useMaybeDraft({
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
}: useMaybeDraft.isDraftForItem.Args<FernApiEditor.TypeId, DraftTypeSidebarItemId>): boolean {
    return draft.typeId === typeId;
}
