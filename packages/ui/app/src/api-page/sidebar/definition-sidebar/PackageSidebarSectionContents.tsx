import { FernRegistry } from "@fern-fern/registry";
import { PackagePath } from "../../../commons/PackagePath";
import { CollapsibleSidebarSection } from "./CollapsibleSidebarSection";
import { EndpointSidebarItem } from "./EndpointSidebarItem";
import { PackageSidebarSection } from "./PackageSidebarSection";
import styles from "./PackageSidebarSectionContents.module.scss";
import { TypeSidebarItem } from "./TypeSidebarItem";

export declare namespace PackageSidebarSectionContents {
    export interface Props {
        package: FernRegistry.ApiDefinitionPackage;
        packagePath: PackagePath;
    }
}

export const PackageSidebarSectionContents: React.FC<PackageSidebarSectionContents.Props> = ({
    package: package_,
    packagePath,
}) => {
    return (
        <div className={styles.container}>
            {package_.endpoints.map((endpoint, endpointIndex) => (
                <EndpointSidebarItem key={endpointIndex} endpoint={endpoint} packagePath={packagePath} />
            ))}
            {package_.subpackages.map((subpackageId) => (
                <PackageSidebarSection key={subpackageId} subpackageId={subpackageId} packagePath={packagePath} />
            ))}
            {package_.types.length > 0 && (
                <CollapsibleSidebarSection title="Types">
                    {package_.types.map((typeId) => (
                        <TypeSidebarItem key={typeId} typeId={typeId} />
                    ))}
                </CollapsibleSidebarSection>
            )}
        </div>
    );
};
