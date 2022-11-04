import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useMemo } from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import { useSidebarContext } from "./useSidebarContext";

export function useError(errorId: FernApiEditor.ErrorId): FernApiEditor.Error {
    const { definition } = useApiEditorContext();
    const { draft } = useSidebarContext();

    return useMemo((): FernApiEditor.Error => {
        const persistedError = definition.errors[errorId];
        if (persistedError != null) {
            return persistedError;
        }
        if (draft?.type === "error" && draft.errorId === errorId) {
            return {
                errorId,
                errorName: "",
                statusCode: "400",
            };
        }
        throw new Error("Error does not exist: " + errorId);
    }, [definition.errors, draft, errorId]);
}
