import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useContext, useMemo } from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { doesSubpackageHaveEndpointsRecursive } from "../api-page/subpackages/doesSubpackageHaveEndpointsRecursive";
import { SubpackageTitle } from "../api-page/subpackages/SubpackageTitle";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
import { SidebarContext } from "./context/SidebarContext";
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
    const { selectedPath } = useDocsContext();
    const { resolveSubpackageById } = useApiDefinitionContext();

    const hasEndpoints = useMemo(
        () => doesSubpackageHaveEndpointsRecursive(subpackage.subpackageId, resolveSubpackageById),
        [resolveSubpackageById, subpackage.subpackageId]
    );

    const isSelected = selectedPath != null && selectedPath.slug === slug;
    const isChildSelected = selectedPath != null && selectedPath.slug.startsWith(`${slug}/`);
    const { expandAllSections } = useContext(SidebarContext)();
    const isOpen = isSelected || isChildSelected || expandAllSections;

    if (!hasEndpoints) {
        return null;
    }

    return (
        <SidebarGroup
            title={
                <NavigatingSidebarItem
                    className="mt-1"
                    title={<SubpackageTitle subpackage={subpackage} />}
                    rightElement={<HiOutlineChevronDown />}
                    slug={slug}
                />
            }
        >
            {isOpen && <ApiPackageSidebarSectionContents package={subpackage} slug={slug} />}
        </SidebarGroup>
    );
};
