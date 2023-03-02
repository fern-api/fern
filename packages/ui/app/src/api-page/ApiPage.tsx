import { generatePath } from "react-router-dom";
import { useCurrentOrganizationIdOrThrow } from "../routes/useCurrentOrganization";
import { ApiTabsContextProvider } from "./api-tabs/context/ApiTabsContextProvider";
import { ApiPageContents } from "./ApiPageContents";
import { DefinitionRoutes } from "./routes";
import { useCurrentApiIdOrThrow } from "./routes/useCurrentApiId";

export const ApiPage: React.FC = () => {
    const organiationId = useCurrentOrganizationIdOrThrow();
    const apiId = useCurrentApiIdOrThrow();

    return (
        <ApiTabsContextProvider
            noTabsRedirectPath={generatePath(DefinitionRoutes.API_DEFINITION.absolutePath, {
                ORGANIZATION_ID: organiationId,
                API_ID: apiId,
            })}
        >
            <ApiPageContents />
        </ApiTabsContextProvider>
    );
};
