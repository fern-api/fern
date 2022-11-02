import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";

export function useError(errorId: FernApiEditor.ErrorId): FernApiEditor.Error {
    const { definition } = useApiEditorContext();
    const error_ = definition.errors[errorId];
    if (error_ == null) {
        throw new Error("Error does not exist: " + errorId);
    }
    return error_;
}
