import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { DraftSidebarItemId } from "./SidebarContext";
import { useSidebarContext } from "./useSidebarContext";

export declare namespace useDraftableItem {
    export interface Args<DefinitionId, DefinitionValue> {
        definitionId: DefinitionId;
        retrieveFromDefinition: (definition: FernApiEditor.Api) => DefinitionValue | undefined;
        convertFromDraft: (draft: DraftSidebarItemId) => DefinitionValue | undefined;
    }
}

export function useDraftableItem<DefinitionId, DefinitionValue>({
    definitionId,
    retrieveFromDefinition,
    convertFromDraft,
}: useDraftableItem.Args<DefinitionId, DefinitionValue>): DefinitionValue {
    const { definition } = useApiEditorContext();
    const { draft } = useSidebarContext();

    return useMemo((): DefinitionValue => {
        const definitionValue = retrieveFromDefinition(definition);
        if (definitionValue != null) {
            return definitionValue;
        }
        if (draft != null) {
            const draftValue = convertFromDraft(draft);
            if (draftValue != null) {
                return draftValue;
            }
        }
        throw new Error("Item does not exist: " + definitionId);
    }, [convertFromDraft, definition, definitionId, draft, retrieveFromDefinition]);
}
