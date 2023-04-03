import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ApiDefinitionContextProvider } from "./api-context/ApiDefinitionContextProvider";
import { ApiPageContents } from "./ApiPageContents";
import { parseEnvironmentIdFromPath } from "./routes/useCurrentEnvironment";

export const ApiPage: React.FC = () => {
    const location = useLocation();
    const environmentId = useMemo(() => parseEnvironmentIdFromPath(location.pathname), [location.pathname]);

    return (
        <ApiDefinitionContextProvider environmentId={environmentId}>
            <ApiPageContents />
        </ApiDefinitionContextProvider>
    );
};
