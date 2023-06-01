import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useCallback, useMemo, useState } from "react";
import { HiOutlineFolder } from "react-icons/hi2";
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

    const [contentsHeight, setContentsHeight] = useState<number>();
    const setContentsRef = useCallback(
        (ref: HTMLElement | null) => {
            if (contentsHeight == null && ref != null) {
                setContentsHeight(ref.getBoundingClientRect().height);
            }
        },
        [contentsHeight]
    );

    if (!hasEndpoints) {
        return null;
    }

    const isSelected = selectedPath != null && selectedPath.slug.startsWith(slug);

    return (
        <SidebarGroup
            title={
                <NavigatingSidebarItem
                    title={<SubpackageTitle subpackage={subpackage} />}
                    icon={<HiOutlineFolder />}
                    slug={slug}
                />
            }
        >
            <div
                ref={setContentsRef}
                className="flex flex-col overflow-hidden transition-[height] duration-500"
                style={contentsHeight != null ? { height: isSelected ? contentsHeight : 0 } : undefined}
            >
                <ApiPackageSidebarSectionContents package={subpackage} slug={slug} />
            </div>
        </SidebarGroup>
    );
};
