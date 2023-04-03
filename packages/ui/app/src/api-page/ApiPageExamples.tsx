import { assertNever } from "@fern-api/core-utils";
import { useLocation } from "react-router-dom";
import { EndpointExamples } from "./definition/endpoints/endpoint-examples/EndpointExamples";
import { DefinitionItemExamplesLayout } from "./definition/examples/DefinitionItemExamplesLayout";
import { TypeExamples } from "./definition/types/examples/TypeExamples";
import { useParsedDefinitionPath } from "./routes/useParsedDefinitionPath";

export const ApiPageExamples: React.FC = () => {
    const location = useLocation();
    const parsedPath = useParsedDefinitionPath(location.pathname);

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
