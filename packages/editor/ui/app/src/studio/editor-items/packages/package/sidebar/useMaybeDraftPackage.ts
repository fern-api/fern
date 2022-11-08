import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { MaybeDraftPackage } from "../../../../sidebar/drafts/DraftableItem";
import { DraftPackageSidebarItemId, DraftSidebarItemId } from "../../../../sidebar/drafts/DraftSidebarItemId";
import { useMaybeDraft } from "../../../shared/useMaybeDraft";

export function useMaybeDraftPackage(packageId: FernApiEditor.PackageId): MaybeDraftPackage {
    const retrieveFromDefinition = useCallback(
        (definition: FernApiEditor.Api) => definition.packages[packageId],
        [packageId]
    );
    return useMaybeDraft({
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
}: useMaybeDraft.isDraftForItem.Args<FernApiEditor.PackageId, DraftPackageSidebarItemId>): boolean {
    return draft.packageId === packageId;
}
