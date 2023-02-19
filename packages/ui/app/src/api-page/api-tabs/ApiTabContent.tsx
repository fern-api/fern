import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { useParsedPath } from "../../routes/definition/useParsedPath";
import { ApiDefinitionItemContextProvider } from "../definition/context/ApiDefinitionItemContextProvider";
import { Endpoint } from "../definition/endpoints/Endpoint";
import { Tab } from "./context/ApiTabsContext";

export declare namespace ApiTabContent {
    export interface Props {
        tab: Tab;
    }
}

export const ApiTabContent: React.FC<ApiTabContent.Props> = ({ tab }) => {
    const parsedPath = useParsedPath(tab.path);

    if (parsedPath == null) {
        return <NonIdealState title="Page not found" />;
    }

    switch (parsedPath.type) {
        case "endpoint":
            return (
                <ApiDefinitionItemContextProvider environmentId={parsedPath.environmentId}>
                    <Endpoint endpoint={parsedPath.endpoint} />
                </ApiDefinitionItemContextProvider>
            );
        case "type":
            return (
                <ApiDefinitionItemContextProvider environmentId={parsedPath.environmentId}>
                    <div>type page</div>
                </ApiDefinitionItemContextProvider>
            );
        default:
            assertNever(parsedPath);
    }
};
