import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { MaybeDraftPackage } from "../drafts/DraftableItem";
import { DraftPackageSidebarItemId, DraftSidebarItemId } from "../drafts/DraftSidebarItemId";
import { useDraftableItem } from "./useDraftableItem";

export function usePackage(packageId: FernApiEditor.PackageId): MaybeDraftPackage {
    const retrieveFromDefinition = useCallback(
        (definition: FernApiEditor.Api) => definition.packages[packageId],
        [packageId]
    );
    return useDraftableItem({
        definitionId: packageId,
        retrieveFromDefinition,
        narrowDraft,
        isDraftForItem,
    });
}

function narrowDraft(draft: DraftSidebarItemId): DraftPackageSidebarItemId | undefined {
    if (draft.type === "package") {
        return draft;
    }
    return undefined;
}

function isDraftForItem({
    definitionId: packageId,
    draft,
}: useDraftableItem.isDraftForItem.Args<FernApiEditor.PackageId, DraftPackageSidebarItemId>): boolean {
    return draft.packageId === packageId;
}
