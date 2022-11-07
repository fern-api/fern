import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { DraftableItem, Persisted } from "../drafts/DraftableItem";
import { DraftSidebarItemId } from "../drafts/DraftSidebarItemId";
import { useSidebarContext } from "./useSidebarContext";

export declare namespace useDraftableItem {
    export interface Args<DefinitionId, DefinitionValue, DraftId extends DraftSidebarItemId> {
        definitionId: DefinitionId;
        retrieveFromDefinition: (definition: FernApiEditor.Api) => DefinitionValue | undefined;
        narrowDraft: (draft: DraftSidebarItemId) => DraftId | undefined;
        isDraftForItem: (args: isDraftForItem.Args<DefinitionId, DraftId>) => boolean;
    }

    export namespace isDraftForItem {
        export interface Args<DefinitionId, DraftId extends DraftSidebarItemId> {
            draft: DraftId;
            definitionId: DefinitionId;
        }
    }
}

export function useDraftableItem<DefinitionId, DefinitionValue, DraftId extends DraftSidebarItemId>({
    definitionId,
    retrieveFromDefinition,
    narrowDraft,
    isDraftForItem,
}: useDraftableItem.Args<DefinitionId, DefinitionValue, DraftId>): DraftableItem<DefinitionValue, DraftId> {
    const { definition } = useApiEditorContext();
    const { draft } = useSidebarContext();

    return useMemo((): DraftableItem<DefinitionValue, DraftId> => {
        const definitionValue = retrieveFromDefinition(definition);
        if (definitionValue != null) {
            // for some reason, we need to assign to a separate variable.
            // otherwise, the compiler doesn't complain if we just return { isDraft: false }
            const persisted: Persisted<DefinitionValue> = { ...definitionValue, isDraft: false };
            return persisted;
        }
        if (draft != null) {
            const narrowedDraft = narrowDraft(draft);
            if (narrowedDraft != null && isDraftForItem({ draft: narrowedDraft, definitionId })) {
                return { ...narrowedDraft, isDraft: true };
            }
        }
        throw new Error("Item does not exist: " + definitionId);
    }, [definition, definitionId, draft, isDraftForItem, narrowDraft, retrieveFromDefinition]);
}
