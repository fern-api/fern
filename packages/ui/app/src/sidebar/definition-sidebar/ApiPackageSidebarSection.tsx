import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { startCase } from "lodash-es";
import { useMemo } from "react";
import { generatePath, useLocation } from "react-router-dom";
import { ResolvedUrlPath } from "../../api-page/api-context/url-path-resolver/UrlPathResolver";
import { useApiDefinitionContext } from "../../api-page/api-context/useApiDefinitionContext";
import { DefinitionRoutes } from "../../api-page/routes";
import { useCurrentPathname } from "../../api-page/routes/useCurrentPathname";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { SidebarGroup } from "./SidebarGroup";

export declare namespace ApiPackageSidebarSection {
    export interface Props {
        subpackageId: FernRegistryApiRead.SubpackageId;
    }
}

export const ApiPackageSidebarSection: React.FC<ApiPackageSidebarSection.Props> = ({ subpackageId }) => {
    const { resolveSubpackageById, urlPathResolver } = useApiDefinitionContext();
    const subpackage = resolveSubpackageById(subpackageId);

    const currentPathname = useCurrentPathname();
    const location = useLocation();
    const isSelected = useMemo(
        () =>
            urlPathResolver.isSubpackageSelected({
                subpackageId,
                pathname: currentPathname,
                hash: location.hash,
            }),
        [currentPathname, location.hash, subpackageId, urlPathResolver]
    );

    const isEndpointSelected = useMemo(
        () =>
            urlPathResolver.isSubpackageEndpointSelected({
                subpackageId,
                pathname: currentPathname,
                hash: location.hash,
            }),
        [currentPathname, location.hash, subpackageId, urlPathResolver]
    );

    const subpackagePath = useMemo(
        () => urlPathResolver.getUrlPathForSubpackage(subpackageId),
        [subpackageId, urlPathResolver]
    );

    const targetUrlPath = useMemo(
        () =>
            generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
                "*": subpackagePath,
            }),
        [subpackagePath]
    );

    const resolvedUrlPath = useMemo(
        (): ResolvedUrlPath => ({
            type: "subpackage",
            subpackageId,
            endpointId: undefined,
        }),
        [subpackageId]
    );

    const hasEndpoints = useMemo(
        () => hasEndpointsRecursive(subpackageId, resolveSubpackageById),
        [resolveSubpackageById, subpackageId]
    );
    if (!hasEndpoints) {
        return null;
    }

    return (
        <SidebarGroup
            title={<div className="font-bold">{startCase(subpackage.name)}</div>}
            path={targetUrlPath}
            resolvedUrlPath={resolvedUrlPath}
            isSelected={isSelected}
        >
            <ApiPackageSidebarSectionContents
                package={subpackage}
                shouldShowEndpoints={isSelected || isEndpointSelected}
                subpackageId={subpackageId}
            />
        </SidebarGroup>
    );
};

function hasEndpointsRecursive(
    subpackageId: FernRegistryApiRead.SubpackageId,
    resolveSubpackageById: (
        subpackageId: FernRegistryApiRead.SubpackageId
    ) => FernRegistryApiRead.ApiDefinitionSubpackage
): boolean {
    const subpackage = resolveSubpackageById(subpackageId);
    if (subpackage.endpoints.length > 0) {
        return true;
    }
    return subpackage.subpackages.some((s) => hasEndpointsRecursive(s, resolveSubpackageById));
}
