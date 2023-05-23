import { PropsWithChildren, useCallback } from "react";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";

export const ListTypeContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const contextValue = useTypeDefinitionContext();
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath: [
                ...contextValue.jsonPropertyPath,
                {
                    type: "listItem",
                },
            ],
        }),
        [contextValue]
    );

    return <TypeDefinitionContext.Provider value={newContextValue}>{children}</TypeDefinitionContext.Provider>;
};
