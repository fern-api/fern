import { PropsWithChildren, useCallback } from "react";
import { ParsedEnvironmentId } from "../../../routes/useCurrentEnvironment";
import { ApiDefinitionSidebarContext, ApiDefinitionSidebarContextValue } from "./ApiDefinitionSidebarContext";

export declare namespace ApiDefinitionSidebarContextProvider {
    export type Props = PropsWithChildren<{
        environmentId: ParsedEnvironmentId;
    }>;
}

export const ApiDefinitionSidebarContextProvider: React.FC<ApiDefinitionSidebarContextProvider.Props> = ({
    environmentId,
    children,
}) => {
    const contextValue = useCallback(
        (): ApiDefinitionSidebarContextValue => ({
            environmentId,
        }),
        [environmentId]
    );

    return <ApiDefinitionSidebarContext.Provider value={contextValue}>{children}</ApiDefinitionSidebarContext.Provider>;
};
