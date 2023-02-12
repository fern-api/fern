import { LocalTextState } from "@fern-api/react-commons";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { useTransactionalTextState } from "../../../shared/page/useTransactionalTextState";

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
