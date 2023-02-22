import { generatePath } from "react-router-dom";
import { ApiTabsContextProvider } from "./api-tabs/context/ApiTabsContextProvider";
import { ApiPageContents } from "./ApiPageContents";
import { DefinitionRoutes } from "./routes";
import { useCurrentApiIdOrThrow } from "./routes/useCurrentApiId";

export const ApiPage: React.FC = () => {
    const apiId = useCurrentApiIdOrThrow();

    return (
        <ApiTabsContextProvider
            noTabsRedirectPath={generatePath(DefinitionRoutes.API_DEFINITION.absolutePath, {
                API_ID: apiId,
            })}
        >
            <ApiPageContents />
        </ApiTabsContextProvider>
    );
};
