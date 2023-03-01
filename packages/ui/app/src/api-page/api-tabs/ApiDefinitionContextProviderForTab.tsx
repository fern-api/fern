import { PropsWithChildren } from "react";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { parseEnvironmentIdFromPath } from "../routes/useCurrentEnvironment";
import { Tab } from "./context/ApiTabsContext";

export declare namespace ApiDefinitionContextProviderForTab {
    export type Props = PropsWithChildren<{
        tab: Tab;
        fallback?: JSX.Element;
    }>;
}

export const ApiDefinitionContextProviderForTab: React.FC<ApiDefinitionContextProviderForTab.Props> = ({
    tab,
    fallback = null,
    children,
}) => {
    const environmentId = parseEnvironmentIdFromPath(tab.path);

    if (environmentId == null) {
        return fallback;
    }

    return (
        <ApiDefinitionContextProvider key={tab.path} environmentId={environmentId}>
            {children}
        </ApiDefinitionContextProvider>
    );
};
