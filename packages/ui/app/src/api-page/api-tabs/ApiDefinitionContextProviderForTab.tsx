import { FernRegistry } from "@fern-fern/registry";
import { PropsWithChildren } from "react";
import { matchPath } from "react-router-dom";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { DefinitionRoutes } from "../routes";
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
    const match = matchPath(DefinitionRoutes.API_PACKAGE.absolutePath, tab.path);
    const environmentId = match?.params.ENVIRONMENT_ID;

    if (environmentId == null) {
        return fallback;
    }

    return (
        <ApiDefinitionContextProvider key={tab.path} environmentId={FernRegistry.EnvironmentId(environmentId)}>
            {children}
        </ApiDefinitionContextProvider>
    );
};
