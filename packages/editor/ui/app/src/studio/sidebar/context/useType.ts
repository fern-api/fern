import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";

export function useType(typeId: FernApiEditor.TypeId): FernApiEditor.Type {
    const { definition } = useApiEditorContext();
    const type_ = definition.types[typeId];
    if (type_ == null) {
        throw new Error("Type does not exist: " + typeId);
    }
    return type_;
}
