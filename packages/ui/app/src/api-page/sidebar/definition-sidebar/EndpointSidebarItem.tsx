import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { generatePath, useLocation } from "react-router-dom";
import { useCurrentOrganizationIdOrThrow } from "../../../routes/useCurrentOrganization";
import { ResolvedSubpackagePath } from "../../api-context/url-path-resolver/UrlPathResolver";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { EndpointTitle } from "../../definition/endpoints/EndpointTitle";
import { DefinitionRoutes } from "../../routes";
import { useCurrentApiIdOrThrow } from "../../routes/useCurrentApiId";
import { useCurrentPathname } from "../../routes/useCurrentPathname";
import { ClickableSidebarItem } from "./ClickableSidebarItem";

export declare namespace EndpointSidebarItem {
    export interface Props {
        subpackageId: FernRegistry.SubpackageId;
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpoint, subpackageId }) => {
    const { urlPathResolver } = useApiDefinitionContext();

    const endpointPath = useMemo(
        () => urlPathResolver.getUrlPathForEndpoint(subpackageId, endpoint.id),
        [endpoint.id, subpackageId, urlPathResolver]
    );

    const currentPathname = useCurrentPathname();
    const location = useLocation();
    const isSelected = useMemo(
        () =>
            urlPathResolver.isEndpointSelected({
                subpackageId,
                endpointId: endpoint.id,
                pathname: currentPathname,
                hash: location.hash,
            }),
        [currentPathname, endpoint.id, location.hash, subpackageId, urlPathResolver]
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

    const resolvedUrlPath = useMemo(
        (): ResolvedSubpackagePath => ({
            type: "subpackage",
            subpackageId,
            endpointId: endpoint.id,
        }),
        [endpoint.id, subpackageId]
    );

    return (
        <ClickableSidebarItem
            path={targetUrlPath}
            title={<EndpointTitle endpoint={endpoint} />}
            isSelected={isSelected}
            resolvedUrlPath={resolvedUrlPath}
        />
    );
};
