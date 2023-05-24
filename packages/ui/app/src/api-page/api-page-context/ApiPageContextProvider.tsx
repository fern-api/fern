import React, { PropsWithChildren, useCallback } from "react";
import { ApiPageContext, ApiPageContextValue } from "./ApiPageContext";

export declare namespace ApiPageContextProvider {
    export type Props = PropsWithChildren<{
        containerRef: HTMLElement | undefined;
    }>;
}

export const ApiPageContextProvider: React.FC<ApiPageContextProvider.Props> = ({ containerRef, children }) => {
    const contextValue = useCallback(
        (): ApiPageContextValue => ({
            containerRef,
        }),
        [containerRef]
    );

    return <ApiPageContext.Provider value={contextValue}>{children}</ApiPageContext.Provider>;
};
