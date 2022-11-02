import { TransactionResolver } from "@fern-api/transaction-resolver";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ApiEditorContext, ApiEditorContextValue } from "./ApiEditorContext";

export declare namespace ApiEditorContextProvider {
    export type Props = React.PropsWithChildren<{
        initialApi: FernApiEditor.Api;
    }>;
}

export const ApiEditorContextProvider: React.FC<ApiEditorContextProvider.Props> = ({ initialApi, children }) => {
    const [definition, setDefinition] = useState<FernApiEditor.Api>(initialApi);
    const transactionResolver = useRef(new TransactionResolver({ definition }));

    useEffect(() => {
        const cleanup = transactionResolver.current.watch(setDefinition);
        return cleanup;
    }, []);

    const submitTransaction = useCallback((transaction: FernApiEditor.transactions.Transaction) => {
        transactionResolver.current.applyTransaction(transaction);
    }, []);

    const value = useCallback(
        (): ApiEditorContextValue => ({
            definition,
            submitTransaction,
        }),
        [definition, submitTransaction]
    );

    return <ApiEditorContext.Provider value={value}>{children}</ApiEditorContext.Provider>;
};
