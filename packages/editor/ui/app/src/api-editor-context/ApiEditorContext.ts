import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useContext } from "react";

export const ApiEditorContext = React.createContext<() => ApiEditorContextValue>(() => {
    throw new Error("ApiEditorContext not found in tree.");
});

export interface ApiEditorContextValue {
    definition: FernApiEditor.Api;
    submitTransaction: (transaction: FernApiEditor.transactions.Transaction) => void;
}

export function useApiEditorContext(): ApiEditorContextValue {
    return useContext(ApiEditorContext)();
}
