import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { ApiDefinitionItemContextProvider } from "../definition/context/ApiDefinitionItemContextProvider";
import { Endpoint } from "../definition/endpoints/Endpoint";
import { TypePage } from "../definition/types/TypePage";
import { useParsedDefinitionPath } from "../routes/useParsedDefinitionPath";
import { Tab } from "./context/ApiTabsContext";

export declare namespace ApiTabContent {
    export interface Props {
        tab: Tab;
    }
}

export const ApiTabContent: React.FC<ApiTabContent.Props> = ({ tab }) => {
    const parsedPath = useParsedDefinitionPath(tab.path);

    if (parsedPath.type !== "loaded") {
        return null;
    }

    if (parsedPath.value == null) {
        return <NonIdealState title="Page not found" />;
    }

    switch (parsedPath.value.type) {
        case "endpoint":
            return (
                <ApiDefinitionItemContextProvider environmentId={parsedPath.value.environmentId}>
                    <Endpoint endpoint={parsedPath.value.endpoint} />
                </ApiDefinitionItemContextProvider>
            );
        case "type":
            return (
                <ApiDefinitionItemContextProvider environmentId={parsedPath.value.environmentId}>
                    <TypePage type={parsedPath.value.typeDefinition} />
                </ApiDefinitionItemContextProvider>
            );
        default:
            assertNever(parsedPath.value);
    }
};
