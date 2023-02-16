import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Loadable, mapLoadable } from "@fern-api/loadable";
import { useBooleanState } from "@fern-api/react-commons";
import { FernRegistry } from "@fern-fern/registry";
import { useApiContext } from "../../context/useApiContext";
import styles from "./PackageSidebarSection.module.scss";
import { PackageSidebarSectionContents } from "./PackageSidebarSectionContents";

export declare namespace PackageSidebarSection {
    export interface Props {
        packageId: FernRegistry.PackageId;
    }
}

export const PackageSidebarSection: React.FC<PackageSidebarSection.Props> = ({ packageId }) => {
    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(true);

    const package_ = usePackage(packageId);

    if (package_.type !== "loaded" || package_.value == null) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper} onClick={toggleIsCollapsed}>
                <Icon icon={isCollapsed ? IconNames.CARET_RIGHT : IconNames.CARET_DOWN} />
            </div>
            <div>{packageId}</div>
            <div className={styles.leftLineWrapper}>
                <div className={styles.leftLine} />
            </div>
            {isCollapsed || <PackageSidebarSectionContents package={package_.value} />}
        </div>
    );
};

function usePackage(packageId: FernRegistry.PackageId): Loadable<FernRegistry.ApiDefinitionPackage | undefined> {
    const { api } = useApiContext();
    return mapLoadable(api, (loadedApi) => loadedApi.packages[packageId]);
}
