import { TransactionResolver } from "@fern-api/transaction-resolver";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useEffect, useState } from "react";
import { ApiEditorContext, ApiEditorContextValue } from "./ApiEditorContext";
import { TransactionLogger } from "./TransactionLogger";

export declare namespace ApiEditorContextProvider {
    export type Props = React.PropsWithChildren<{
        initialApi: FernApiEditor.Api;
    }>;
}

export const ApiEditorContextProvider: React.FC<ApiEditorContextProvider.Props> = ({ initialApi, children }) => {
    const [definition, setDefinition] = useState<FernApiEditor.Api>(initialApi);
    const [transactionResolver] = useState(() => new TransactionResolver({ definition }));

    useEffect(() => {
        const cleanup = transactionResolver.watch(setDefinition);
        return cleanup;
    }, [transactionResolver]);

    const submitTransaction = useCallback(
        (transaction: FernApiEditor.transactions.Transaction) => {
            const newState = transactionResolver.applyTransaction(transaction);
            TransactionLogger.logStateChange({
                transaction,
                oldState: definition,
                newState,
            });
        },
        [definition, transactionResolver]
    );

    const value = useCallback(
        (): ApiEditorContextValue => ({
            definition,
            submitTransaction,
        }),
        [definition, submitTransaction]
    );

    return <ApiEditorContext.Provider value={value}>{children}</ApiEditorContext.Provider>;
};
