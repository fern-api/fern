import { FernRegistry } from "@fern-fern/registry";
import { EndpointSidebarItem } from "./EndpointSidebarItem";
import { PackageSidebarSection } from "./PackageSidebarSection";
import styles from "./PackageSidebarSectionContents.module.scss";

export declare namespace PackageSidebarSectionContents {
    export interface Props {
        package: FernRegistry.ApiDefinitionPackage;
    }
}

export const PackageSidebarSectionContents: React.FC<PackageSidebarSectionContents.Props> = ({ package: package_ }) => {
    return (
        <div className={styles.container}>
            {package_.endpoints.map((endpoint, endpointIndex) => (
                <EndpointSidebarItem key={endpointIndex} endpoint={endpoint} />
            ))}
            {package_.subpackages.map((subpackageId) => (
                <PackageSidebarSection key={subpackageId} packageId={subpackageId} />
            ))}
        </div>
    );
};
