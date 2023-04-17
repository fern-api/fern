import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { generatePath } from "react-router-dom";
import { useCurrentOrganizationIdOrThrow } from "../../../routes/useCurrentOrganization";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { EndpointTitle } from "../../definition/endpoints/EndpointTitle";
import { DefinitionRoutes } from "../../routes";
import { useCurrentApiIdOrThrow } from "../../routes/useCurrentApiId";
import { useCurrentPathname } from "../../routes/useCurrentPathname";
import { ClickableSidebarItem } from "./ClickableSidebarItem";

export declare namespace TopLevelEndpointSidebarItem {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const TopLevelEndpointSidebarItem: React.FC<TopLevelEndpointSidebarItem.Props> = ({ endpoint }) => {
    const { urlPathResolver } = useApiDefinitionContext();

    const endpointPath = useMemo(
        () => urlPathResolver.getUrlPathForTopLevelEndpoint(endpoint.id),
        [endpoint.id, urlPathResolver]
    );

    const currentPathname = useCurrentPathname();
    const isSelected = useMemo(
        () =>
            urlPathResolver.isTopLevelEndpointSelected({
                endpointId: endpoint.id,
                pathname: currentPathname,
            }),
        [currentPathname, endpoint.id, urlPathResolver]
    );

    const organizationId = useCurrentOrganizationIdOrThrow();
    const apiId = useCurrentApiIdOrThrow();
    const targetUrlPath = useMemo(
        () =>
            generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
                ENVIRONMENT_ID: "latest",
                ORGANIZATION_ID: organizationId,
                API_ID: apiId,
                "*": endpointPath,
            }),
        [apiId, endpointPath, organizationId]
    );

    return (
        <ClickableSidebarItem
            path={targetUrlPath}
            title={<EndpointTitle endpoint={endpoint} />}
            isSelected={isSelected}
        />
    );
};
