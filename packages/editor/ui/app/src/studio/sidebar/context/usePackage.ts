import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { DraftSidebarItemId } from "./SidebarContext";
import { useDraftableItem } from "./useDraftableItem";

export function usePackage(packageId: FernApiEditor.PackageId): FernApiEditor.Package {
    const retrieveFromDefinition = useCallback(
        (definition: FernApiEditor.Api) => definition.packages[packageId],
        [packageId]
    );

    const convertFromDraft = useCallback(
        (draft: DraftSidebarItemId): FernApiEditor.Package | undefined => {
            if (draft.type === "package" && draft.packageId === packageId) {
                return {
                    packageId,
                    packageName: "",
                    packages: [],
                    endpoints: [],
                    types: [],
                    errors: [],
                };
            } else {
                return undefined;
            }
        },
        [packageId]
    );

    return useDraftableItem({
        definitionId: packageId,
        retrieveFromDefinition,
        convertFromDraft,
    });
}
