import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { AiFillFolder, AiFillFolderOpen } from "react-icons/ai";
import { PackagePath } from "../../../commons/PackagePath";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { CollapsibleSidebarSection } from "./CollapsibleSidebarSection";
import { DefinitionSidebarIconLayout } from "./DefinitionSidebarIconLayout";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";

export declare namespace PackageSidebarSection {
    export interface Props {
        subpackageId: FernRegistry.SubpackageId;
        packagePath: PackagePath;
    }
}

const FOLDER_COLOR = "#0cac57";
const FOLDER_SIZE = 20;

export const PackageSidebarSection: React.FC<PackageSidebarSection.Props> = ({ subpackageId, packagePath }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();
    const subpackage = resolveSubpackageById(subpackageId);

    const packageNames = useMemo(() => [...packagePath, subpackage.name], [packagePath, subpackage.name]);

    const renderTitle = useCallback(
        ({ isCollapsed, isHovering }: { isCollapsed: boolean; isHovering: boolean }) => {
            return (
                <div className="flex gap-1 items-center">
                    <DefinitionSidebarIconLayout>
                        {isCollapsed ? (
                            <AiFillFolder color={FOLDER_COLOR} size={FOLDER_SIZE} />
                        ) : (
                            <AiFillFolderOpen color={FOLDER_COLOR} size={FOLDER_SIZE} />
                        )}
                    </DefinitionSidebarIconLayout>
                    <div
                        className={classNames({
                            "font-bold": isHovering,
                        })}
                    >
                        {subpackage.name}
                    </div>
                </div>
            );
        },
        [subpackage.name]
    );

    return (
        <CollapsibleSidebarSection title={renderTitle}>
            <PackageSidebarSectionContents package={subpackage} packagePath={packageNames} />
        </CollapsibleSidebarSection>
    );
};
