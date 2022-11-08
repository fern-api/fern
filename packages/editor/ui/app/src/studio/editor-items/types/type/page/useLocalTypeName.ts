import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { LocalTextState } from "@fern-ui/react-commons";
import { useCallback } from "react";
import { useTransactionalTextState } from "../../../shared/useTransactionalTextState";

export function useLocalTypeName(type: FernApiEditor.Type): LocalTextState {
    const constructEditTransaction = useCallback(
        (newTypeName: string) =>
            TransactionGenerator.renameType({
                typeId: type.typeId,
                newTypeName,
            }),
        [type.typeId]
    );

    return useTransactionalTextState({
        persistedValue: type.typeName,
        constructEditTransaction,
    });
}
