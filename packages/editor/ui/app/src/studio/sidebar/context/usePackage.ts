import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { useSidebarContext } from "./useSidebarContext";

export function usePackage(packageId: FernApiEditor.PackageId): FernApiEditor.Package {
    const { definition } = useApiEditorContext();
    const { draft } = useSidebarContext();

    return useMemo((): FernApiEditor.Package => {
        const persistedPackage = definition.packages[packageId];
        if (persistedPackage != null) {
            return persistedPackage;
        }
        if (draft?.type === "package" && draft.packageId === packageId) {
            return {
                packageId,
                packageName: draft.packageName ?? "",
                packages: [],
                endpoints: [],
                types: [],
                errors: [],
            };
        }
        throw new Error("Package does not exist: " + packageId);
    }, [definition.packages, draft, packageId]);
}
