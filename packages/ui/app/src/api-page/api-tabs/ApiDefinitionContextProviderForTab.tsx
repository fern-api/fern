import { PropsWithChildren, useMemo } from "react";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { parseEnvironmentIdFromPath } from "../routes/useCurrentEnvironment";
import { Tab } from "./context/ApiTabsContext";

export declare namespace ApiDefinitionContextProviderForTab {
    export type Props = PropsWithChildren<{
        tab: Tab;
    }>;
}

export const ApiDefinitionContextProviderForTab: React.FC<ApiDefinitionContextProviderForTab.Props> = ({
    tab,
    children,
}) => {
    const environmentId = useMemo(() => parseEnvironmentIdFromPath(tab.path), [tab.path]);

    return (
        <ApiDefinitionContextProvider key={tab.path} environmentId={environmentId}>
            {children}
        </ApiDefinitionContextProvider>
    );
};
