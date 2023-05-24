import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { doesSubpackageHaveEndpointsRecursive } from "../api-page/subpackages/doesSubpackageHaveEndpointsRecursive";
import { SubpackageTitle } from "../api-page/subpackages/SubpackageTitlte";
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
        () => doesSubpackageHaveEndpointsRecursive(subpackage.subpackageId, resolveSubpackageById),
        [resolveSubpackageById, subpackage.subpackageId]
    );

    const path = useMemo(
        (): ResolvedUrlPath.ApiSubpackage => ({
            type: "apiSubpackage",
            apiSection,
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
        <SidebarGroup title={<NavigatingSidebarItem title={<SubpackageTitle subpackage={subpackage} />} path={path} />}>
            <ApiSubpackageSidebarSectionContents subpackage={subpackage} slug={slug} />
        </SidebarGroup>
    );
};
