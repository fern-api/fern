import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { useLocation } from "react-router-dom";
import { Endpoint } from "./definition/endpoints/Endpoint";
import { TypePage } from "./definition/types/TypePage";
import { useParsedDefinitionPath } from "./routes/useParsedDefinitionPath";

export const ApiPageMainContent: React.FC = () => {
    const location = useLocation();
    const parsedPath = useParsedDefinitionPath(location.pathname);

    if (parsedPath.type !== "loaded") {
        return null;
    }

    if (parsedPath.value == null) {
        return <NonIdealState title="Page not found" />;
    }

    switch (parsedPath.value.type) {
        case "endpoint":
            return <Endpoint endpoint={parsedPath.value.endpoint} />;
        case "type":
            return <TypePage type={parsedPath.value.typeDefinition} />;
        default:
            assertNever(parsedPath.value);
    }
};
