import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { startCase } from "lodash-es";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { ApiSubpackageSidebarSectionContents } from "./ApiSubpackageSidebarSectionContents";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";
import { SidebarGroup } from "./SidebarGroup";

export declare namespace ApiSubpackageSidebarSection {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
    }
}

export const ApiSubpackageSidebarSection: React.FC<ApiSubpackageSidebarSection.Props> = ({ subpackage, slug }) => {
    const { resolveSubpackageById, apiSection, apiSlug } = useApiDefinitionContext();

    const hasEndpoints = useMemo(
        () => hasEndpointsRecursive(subpackage.subpackageId, resolveSubpackageById),
        [resolveSubpackageById, subpackage.subpackageId]
    );

    const path = useMemo(
        (): ResolvedUrlPath.ApiSubpackage => ({
            type: "apiSubpackage",
            api: apiSection,
            apiSlug,
            subpackage,
            slug,
        }),
        [apiSection, apiSlug, slug, subpackage]
    );

    if (!hasEndpoints) {
        return null;
    }

    return (
        <SidebarGroup title={<NavigatingSidebarItem title={startCase(subpackage.name)} path={path} />}>
            <ApiSubpackageSidebarSectionContents subpackage={subpackage} slug={slug} />
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
