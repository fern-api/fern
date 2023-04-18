import { FernRegistry } from "@fern-fern/registry";
import { useContext, useMemo } from "react";
import { generatePath, useLocation } from "react-router-dom";
import { useCurrentOrganizationIdOrThrow } from "../../../routes/useCurrentOrganization";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { DefinitionRoutes } from "../../routes";
import { useCurrentApiIdOrThrow } from "../../routes/useCurrentApiId";
import { useCurrentPathname } from "../../routes/useCurrentPathname";
import { ApiDefinitionSidebarContext, ApiDefinitionSidebarContextValue } from "./context/ApiDefinitionSidebarContext";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";
import { SidebarSection } from "./SidebarSection";

export declare namespace PackageSidebarSection {
    export interface Props {
        subpackageId: FernRegistry.SubpackageId;
    }
}

export const PackageSidebarSection: React.FC<PackageSidebarSection.Props> = ({ subpackageId }) => {
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

    const organizationId = useCurrentOrganizationIdOrThrow();
    const apiId = useCurrentApiIdOrThrow();
    const targetUrlPath = useMemo(
        () =>
            generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
                ENVIRONMENT_ID: "latest",
                ORGANIZATION_ID: organizationId,
                API_ID: apiId,
                "*": subpackagePath,
            }),
        [apiId, organizationId, subpackagePath]
    );

    const { depth } = useContext(ApiDefinitionSidebarContext);
    const contextValue = useMemo((): ApiDefinitionSidebarContextValue => ({ depth: depth + 1 }), [depth]);

    const hasEndpoints = useMemo(
        () => hasEndpointsRecursive(subpackageId, resolveSubpackageById),
        [resolveSubpackageById, subpackageId]
    );
    if (!hasEndpoints) {
        return null;
    }

    return (
        <SidebarSection
            title={<div className="font-bold">{subpackage.name}</div>}
            path={targetUrlPath}
            isSelected={isSelected}
        >
            <ApiDefinitionSidebarContext.Provider value={contextValue}>
                <PackageSidebarSectionContents
                    package={subpackage}
                    shouldShowEndpoints={isSelected || isEndpointSelected}
                    subpackageId={subpackageId}
                />
            </ApiDefinitionSidebarContext.Provider>
        </SidebarSection>
    );
};

function hasEndpointsRecursive(
    subpackageId: FernRegistry.SubpackageId,
    resolveSubpackageById: (subpackageId: FernRegistry.SubpackageId) => FernRegistry.ApiDefinitionSubpackage
): boolean {
    const subpackage = resolveSubpackageById(subpackageId);
    if (subpackage.endpoints.length > 0) {
        return true;
    }
    return subpackage.subpackages.some((s) => hasEndpointsRecursive(s, resolveSubpackageById));
}
