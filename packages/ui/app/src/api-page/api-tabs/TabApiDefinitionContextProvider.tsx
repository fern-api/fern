import { FernRegistry } from "@fern-fern/registry";
import { PropsWithChildren } from "react";
import { matchPath } from "react-router-dom";
import { FernRoutes } from "../../routes";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { Tab } from "./context/ApiTabsContext";

export declare namespace TabApiDefinitionContextProvider {
    export type Props = PropsWithChildren<{
        tab: Tab;
        fallback?: JSX.Element;
    }>;
}

export const TabApiDefinitionContextProvider: React.FC<TabApiDefinitionContextProvider.Props> = ({
    tab,
    fallback = null,
    children,
}) => {
    const match = matchPath(FernRoutes.API_PACKAGE.absolutePath, tab.path);
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
