import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { generatePath, useLocation } from "react-router-dom";
import { useCurrentOrganizationIdOrThrow } from "../../../routes/useCurrentOrganization";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { DefinitionRoutes } from "../../routes";
import { useCurrentApiIdOrThrow } from "../../routes/useCurrentApiId";
import { useCurrentPathname } from "../../routes/useCurrentPathname";
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

    return (
        <SidebarSection
            title={<div className="font-bold">{subpackage.name}</div>}
            path={targetUrlPath}
            isSelected={isSelected}
        >
            <PackageSidebarSectionContents package={subpackage} shouldShowEndpoints subpackageId={subpackageId} />
        </SidebarSection>
    );
};
