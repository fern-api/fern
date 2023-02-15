import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { PackageId, PackagePath } from "../../context/ApiContext";
import styles from "./PackageSidebarSection.module.scss";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";
import { SidebarItem } from "./SidebarItem";

export declare namespace PackageSidebarSection {
    export interface Props {
        packagePathExcludingSelf: PackagePath;
        package: FernRegistry.ApiDefinitionPackage;
        indexInParent: number;
    }
}

export const PackageSidebarSection: React.FC<PackageSidebarSection.Props> = ({
    package: package_,
    packagePathExcludingSelf,
    indexInParent,
}) => {
    const packagePathIncludingSelf = useMemo(
        (): PackagePath => [...packagePathExcludingSelf, { indexInParent }],
        [indexInParent, packagePathExcludingSelf]
    );

    const packageId = useMemo(
        (): PackageId => ({
            type: "package",
            packagePathIncludingSelf,
        }),
        [packagePathIncludingSelf]
    );

    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(false);

    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper} onClick={toggleIsCollapsed}>
                <Icon icon={isCollapsed ? IconNames.CARET_RIGHT : IconNames.CARET_DOWN} />
            </div>
            <SidebarItem label={"<Package>"} sidebarItemId={packageId} />
            <div className={styles.leftLineWrapper}>
                <div className={styles.leftLine} />
            </div>
            {isCollapsed || (
                <PackageSidebarSectionContents
                    packagePathIncludingSelf={packagePathIncludingSelf}
                    endpoints={package_.endpoints}
                    subPackages={[]}
                />
            )}
        </div>
    );
};
