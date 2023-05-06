import { NonIdealState, Spinner } from "@blueprintjs/core";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useApiDefinition } from "../queries/useApiDefinition";
import { ApiDefinitionContextProvider } from "./api-context/ApiDefinitionContextProvider";
import { ApiPageContents } from "./ApiPageContents";
import { DefinitionRoutes } from "./routes";
import { parseEnvironmentIdFromPath } from "./routes/useCurrentEnvironment";

export const ApiPage: React.FC = () => {
    const location = useLocation();
    const environmentId = useMemo(() => parseEnvironmentIdFromPath(location.pathname), [location.pathname]);

    const { [DefinitionRoutes.API_DEFINITION.parameters.API_ID]: apiId } = useParams();

    if (apiId == null) {
        throw new Error("Api ID is not defined.");
    }
    const api = useApiDefinition({
        apiId: FernRegistry.ApiId(apiId),
        environmentId,
    });

    if (api.type !== "loaded") {
        return <NonIdealState title={<Spinner />} />;
    }

    return (
        <ApiDefinitionContextProvider api={api.value}>
            <ApiPageContents />
        </ApiDefinitionContextProvider>
    );
};
