import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { generatePath, useLocation } from "react-router-dom";
import { useApiDefinitionContext } from "../../api-page/api-context/useApiDefinitionContext";
import { EndpointTitle } from "../../api-page/definition/endpoints/EndpointTitle";
import { DefinitionRoutes } from "../../api-page/routes";
import { useCurrentPathname } from "../../api-page/routes/useCurrentPathname";
import { ClickableSidebarItem } from "./ClickableSidebarItem";

export declare namespace EndpointSidebarItem {
    export interface Props {
        subpackageId: FernRegistryApiRead.SubpackageId;
        endpoint: FernRegistryApiRead.EndpointDefinition;
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

    const targetUrlPath = useMemo(
        () =>
            generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
                "*": endpointPath,
            }),
        [endpointPath]
    );

    // const resolvedUrlPath = useMemo(
    //     (): ResolvedSubpackagePath => ({
    //         type: "subpackage",
    //         subpackageId,
    //         endpointId: endpoint.id,
    //     }),
    //     [endpoint.id, subpackageId]
    // );

    return (
        <ClickableSidebarItem
            path={targetUrlPath}
            title={<EndpointTitle endpoint={endpoint} />}
            isSelected={isSelected}
        />
    );
};
