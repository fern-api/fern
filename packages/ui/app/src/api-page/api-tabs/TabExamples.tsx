import { assertNever } from "@fern-api/core-utils";
import { EndpointExamples } from "../definition/endpoints/endpoint-examples/EndpointExamples";
import { DefinitionItemExamplesLayout } from "../definition/examples/DefinitionItemExamplesLayout";
import { TypeExamples } from "../definition/types/examples/TypeExamples";
import { useParsedDefinitionPath } from "../routes/useParsedDefinitionPath";
import { Tab } from "./context/ApiTabsContext";

export declare namespace TabExamples {
    export interface Props {
        tab: Tab;
    }
}

export const TabExamples: React.FC<TabExamples.Props> = ({ tab }) => {
    const parsedPath = useParsedDefinitionPath(tab.path);

    if (parsedPath.type !== "loaded" || parsedPath.value == null) {
        return <DefinitionItemExamplesLayout />;
    }

    switch (parsedPath.value.type) {
        case "type":
            return <TypeExamples type={parsedPath.value.typeDefinition} />;
        case "endpoint":
            return <EndpointExamples endpoint={parsedPath.value.endpoint} />;
        default:
            assertNever(parsedPath.value);
    }
};
