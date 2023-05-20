import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { startCase } from "lodash-es";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiSubpackageSidebarSectionContents } from "./ApiSubpackageSidebarSectionContents";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";
import { SidebarGroup } from "./SidebarGroup";
import { useIsPathnameSelected } from "./useIsPathnameSelected";

export declare namespace ApiSubpackageSidebarSection {
    export interface Props {
        apiId: FernRegistry.ApiDefinitionId;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
    }
}

export const ApiSubpackageSidebarSection: React.FC<ApiSubpackageSidebarSection.Props> = ({
    apiId,
    subpackage,
    slug,
}) => {
    const { resolveSubpackageById } = useApiDefinitionContext();
    const { scrollToTop } = useDocsContext();

    const hasEndpoints = useMemo(
        () => hasEndpointsRecursive(subpackage.subpackageId, resolveSubpackageById),
        [resolveSubpackageById, subpackage.subpackageId]
    );

    const isSelected = useIsPathnameSelected(slug);

    if (!hasEndpoints) {
        return null;
    }

    const sidebarItem = (
        <NavigatingSidebarItem
            title={<div className="font-bold">{startCase(subpackage.name)}</div>}
            path={slug}
            onClick={scrollToTop}
        />
    );

    if (!isSelected && subpackage.subpackages.length === 0) {
        return sidebarItem;
    }

    return (
        <SidebarGroup title={sidebarItem}>
            <ApiSubpackageSidebarSectionContents
                apiId={apiId}
                subpackage={subpackage}
                shouldShowEndpoints={true}
                slug={slug}
            />
        </SidebarGroup>
    );
};

function hasEndpointsRecursive(
    subpackageId: FernRegistryApiRead.SubpackageId,
    resolveSubpackage: (subpackageId: FernRegistryApiRead.SubpackageId) => FernRegistryApiRead.ApiDefinitionSubpackage
): boolean {
    const subpackage = resolveSubpackage(subpackageId);
    if (subpackage.endpoints.length > 0) {
        return true;
    }
    return subpackage.subpackages.some((s) => hasEndpointsRecursive(s, resolveSubpackage));
}
