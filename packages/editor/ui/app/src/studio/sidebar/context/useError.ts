import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { MaybeDraftError } from "../drafts/DraftableItem";
import { DraftErrorSidebarItemId, DraftSidebarItemId } from "../drafts/DraftSidebarItemId";
import { useDraftableItem } from "./useDraftableItem";

export function useError(errorId: FernApiEditor.ErrorId): MaybeDraftError {
    const retrieveFromDefinition = useCallback(
        (definition: FernApiEditor.Api) => definition.errors[errorId],
        [errorId]
    );
    return useDraftableItem({
        definitionId: errorId,
        retrieveFromDefinition,
        narrowDraft,
        isDraftForItem,
    });
}

function narrowDraft(draft: DraftSidebarItemId): DraftErrorSidebarItemId | undefined {
    if (draft.type === "error") {
        return draft;
    }
    return undefined;
}

function isDraftForItem({
    definitionId: errorId,
    draft,
}: useDraftableItem.isDraftForItem.Args<FernApiEditor.ErrorId, DraftErrorSidebarItemId>): boolean {
    return draft.errorId === errorId;
}
