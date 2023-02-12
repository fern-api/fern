import { LocalTextState } from "@fern-api/react-commons";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useTransactionalTextState } from "../../../shared/page/useTransactionalTextState";

export function useLocalDescription(type: FernApiEditor.Type): LocalTextState {
    const constructEditTransaction = useCallback(
        (description: string) =>
            TransactionGenerator.setTypeDescription({
                typeId: type.typeId,
                description,
            }),
        [type.typeId]
    );

    return useTransactionalTextState({
        persistedValue: type.description ?? "",
        constructEditTransaction,
    });
}
