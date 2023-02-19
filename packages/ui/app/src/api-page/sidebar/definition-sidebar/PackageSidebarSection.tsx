import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { PackagePath } from "../../../commons/PackagePath";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { CollapsibleSidebarSection } from "./CollapsibleSidebarSection";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";

export declare namespace PackageSidebarSection {
    export interface Props {
        subpackageId: FernRegistry.SubpackageId;
        packagePath: PackagePath;
    }
}

export const PackageSidebarSection: React.FC<PackageSidebarSection.Props> = ({ subpackageId, packagePath }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();
    const subpackage = resolveSubpackageById(subpackageId);

    const packageNames = useMemo(() => [...packagePath, subpackage.name], [packagePath, subpackage.name]);

    return (
        <CollapsibleSidebarSection title={subpackage.name}>
            <PackageSidebarSectionContents package={subpackage} packagePath={packageNames} />
        </CollapsibleSidebarSection>
    );
};
