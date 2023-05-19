import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { generatePath, useLocation } from "react-router-dom";
import { useApiDefinitionContext } from "../../api-page/api-context/useApiDefinitionContext";
import { EndpointTitle } from "../../api-page/definition/endpoints/EndpointTitle";
import { DefinitionRoutes } from "../../api-page/routes";
import { useCurrentPathname } from "../../api-page/routes/useCurrentPathname";
import { ClickableSidebarItem } from "./ClickableSidebarItem";

export declare namespace TopLevelEndpointSidebarItem {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const TopLevelEndpointSidebarItem: React.FC<TopLevelEndpointSidebarItem.Props> = ({ endpoint }) => {
    const { urlPathResolver } = useApiDefinitionContext();

    const endpointPath = useMemo(
        () => urlPathResolver.getUrlPathForTopLevelEndpoint(endpoint.id),
        [endpoint.id, urlPathResolver]
    );

    const currentPathname = useCurrentPathname();
    const location = useLocation();
    const isSelected = useMemo(
        () =>
            urlPathResolver.isTopLevelEndpointSelected({
                endpointId: endpoint.id,
                pathname: currentPathname,
                hash: location.hash,
            }),
        [currentPathname, endpoint.id, location.hash, urlPathResolver]
    );

    const targetUrlPath = useMemo(
        () =>
            generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
                "*": endpointPath,
            }),
        [endpointPath]
    );

    // const resolvedUrlPath = useMemo(
    //     (): ResolvedTopLevelEndpointPath => ({
    //         type: "top-level-endpoint",
    //         endpoint,
    //     }),
    //     [endpoint]
    // );

    return (
        <ClickableSidebarItem
            path={targetUrlPath}
            title={<EndpointTitle endpoint={endpoint} />}
            isSelected={isSelected}
        />
    );
};
