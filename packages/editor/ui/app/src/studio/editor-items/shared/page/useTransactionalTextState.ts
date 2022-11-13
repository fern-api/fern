import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { LocalTextState, useLocalTextState } from "@fern-ui/react-commons";
import { useCallback } from "react";
import { useApiEditorContext } from "../../../../api-editor-context/ApiEditorContext";

export declare namespace useTransactionalTextState {
    export interface Args {
        persistedValue: string;
        constructEditTransaction: (newValue: string) => FernApiEditor.transactions.Transaction;
    }
}

export function useTransactionalTextState({
    persistedValue,
    constructEditTransaction,
}: useTransactionalTextState.Args): LocalTextState {
    const { submitTransaction } = useApiEditorContext();

    const onRename = useCallback(
        (newName: string) => {
            submitTransaction(constructEditTransaction(newName));
        },
        [constructEditTransaction, submitTransaction]
    );

    return useLocalTextState({
        persistedValue,
        onRename,
    });
}
