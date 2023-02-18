import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { CollapsibleSidebarSection } from "./CollapsibleSidebarSection";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";

export declare namespace PackageSidebarSection {
    export interface Props {
        subpackageId: FernRegistry.SubpackageId;
        ancestorPackageNames: readonly string[];
    }
}

export const PackageSidebarSection: React.FC<PackageSidebarSection.Props> = ({
    subpackageId,
    ancestorPackageNames,
}) => {
    const { resolveSubpackage } = useApiDefinitionContext();
    const subpackage = resolveSubpackage(subpackageId);

    const packageNames = useMemo(
        () => [...ancestorPackageNames, subpackage.name],
        [ancestorPackageNames, subpackage.name]
    );

    return (
        <CollapsibleSidebarSection title={subpackage.name}>
            <PackageSidebarSectionContents package={subpackage} ancestorPackageNames={packageNames} />
        </CollapsibleSidebarSection>
    );
};
