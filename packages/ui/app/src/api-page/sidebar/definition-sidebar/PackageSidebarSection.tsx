import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { PackagePath } from "../../../commons/PackagePath";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";
import { SidebarSection } from "./SidebarSection";

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
        <SidebarSection title={<div className="font-bold">{subpackage.name}</div>}>
            <PackageSidebarSectionContents package={subpackage} packagePath={packageNames} />
        </SidebarSection>
    );
};
