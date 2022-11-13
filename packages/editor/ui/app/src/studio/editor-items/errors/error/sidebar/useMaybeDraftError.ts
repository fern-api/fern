import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { MaybeDraftError } from "../../../../sidebar/drafts/DraftableItem";
import { DraftErrorSidebarItemId, DraftSidebarItemId } from "../../../../sidebar/drafts/DraftSidebarItemId";
import { useMaybeDraft } from "../../../shared/sidebar/useMaybeDraft";

export function useMaybeDraftError(errorId: FernApiEditor.ErrorId): MaybeDraftError {
    const retrieveFromDefinition = useCallback(
        (definition: FernApiEditor.Api) => definition.errors[errorId],
        [errorId]
    );
    return useMaybeDraft({
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
}: useMaybeDraft.isDraftForItem.Args<FernApiEditor.ErrorId, DraftErrorSidebarItemId>): boolean {
    return draft.errorId === errorId;
}
