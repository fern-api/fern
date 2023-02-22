import { FernRegistry } from "@fern-fern/registry";
import { PropsWithChildren, useCallback } from "react";
import { ApiDefinitionSidebarContext, ApiDefinitionSidebarContextValue } from "./ApiDefinitionSidebarContext";

export declare namespace ApiDefinitionSidebarContextProvider {
    export type Props = PropsWithChildren<{
        environmentId: FernRegistry.EnvironmentId;
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
