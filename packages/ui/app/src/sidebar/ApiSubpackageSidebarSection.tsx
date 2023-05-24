import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { doesSubpackageHaveEndpointsRecursive } from "../api-page/subpackages/doesSubpackageHaveEndpointsRecursive";
import { SubpackageTitle } from "../api-page/subpackages/SubpackageTitle";
import { ApiSubpackageSidebarSectionContents } from "./ApiSubpackageSidebarSectionContents";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";
import { SidebarGroup } from "./SidebarGroup";

export declare namespace ApiSubpackageSidebarSection {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
        isFirstItemInApi?: boolean;
    }
}

export const ApiSubpackageSidebarSection: React.FC<ApiSubpackageSidebarSection.Props> = ({ subpackage, slug }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();

    const hasEndpoints = useMemo(
        () => doesSubpackageHaveEndpointsRecursive(subpackage.subpackageId, resolveSubpackageById),
        [resolveSubpackageById, subpackage.subpackageId]
    );

    if (!hasEndpoints) {
        return null;
    }

    return (
        <SidebarGroup title={<NavigatingSidebarItem title={<SubpackageTitle subpackage={subpackage} />} slug={slug} />}>
            <ApiSubpackageSidebarSectionContents subpackage={subpackage} slug={slug} />
        </SidebarGroup>
    );
};
