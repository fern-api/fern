import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { DraftSidebarItemId } from "./SidebarContext";
import { useDraftableItem } from "./useDraftableItem";

export function useError(errorId: FernApiEditor.ErrorId): FernApiEditor.Error {
    const retrieveFromDefinition = useCallback(
        (definition: FernApiEditor.Api) => definition.errors[errorId],
        [errorId]
    );

    const convertFromDraft = useCallback(
        (draft: DraftSidebarItemId): FernApiEditor.Error | undefined => {
            if (draft.type === "error" && draft.errorId === errorId) {
                return {
                    errorId,
                    errorName: "",
                    statusCode: "400",
                };
            } else {
                return undefined;
            }
        },
        [errorId]
    );

    return useDraftableItem({
        definitionId: errorId,
        retrieveFromDefinition,
        convertFromDraft,
    });
}
