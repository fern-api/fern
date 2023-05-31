import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { doesSubpackageHaveEndpointsRecursive } from "../api-page/subpackages/doesSubpackageHaveEndpointsRecursive";
import { SubpackageTitle } from "../api-page/subpackages/SubpackageTitle";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiPackageSidebarSectionContents } from "./ApiPackageSidebarSectionContents";
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

    if (!hasEndpoints) {
        return null;
    }

    const shouldShowContents = selectedPath != null && selectedPath.slug.startsWith(slug);

    return (
        <SidebarGroup title={<NavigatingSidebarItem title={<SubpackageTitle subpackage={subpackage} />} slug={slug} />}>
            <div
                className={classNames(
                    "flex flex-col transition-[max-height] duration-300 overflow-hidden",
                    shouldShowContents ? "max-h-[1000px]" : "max-h-0"
                )}
            >
                <ApiPackageSidebarSectionContents package={subpackage} slug={slug} />
            </div>
        </SidebarGroup>
    );
};
