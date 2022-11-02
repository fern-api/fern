import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";

export function usePackage(packageId: FernApiEditor.PackageId): FernApiEditor.Package {
    const { definition } = useApiEditorContext();
    const package_ = definition.packages[packageId];
    if (package_ == null) {
        throw new Error("Package does not exist: " + packageId);
    }
    return package_;
}
