import { FernRegistry } from "@fern-fern/registry";
import { PackagePath } from "../../context/ApiContext";
import { EndpointSidebarItem } from "./EndpointSidebarItem";
import { PackageSidebarSection } from "./PackageSidebarSection";
import styles from "./PackageSidebarSectionContents.module.scss";

export declare namespace PackageSidebarSectionContents {
    export interface Props {
        packagePathIncludingSelf: PackagePath;
        endpoints: FernRegistry.EndpointDefinition[];
        subPackages: FernRegistry.ApiDefinitionPackage[];
    }
}

export const PackageSidebarSectionContents: React.FC<PackageSidebarSectionContents.Props> = ({
    packagePathIncludingSelf,
    endpoints,
    subPackages,
}) => {
    return (
        <div className={styles.container}>
            {endpoints.map((endpoint, endpointIndex) => (
                <EndpointSidebarItem
                    key={endpointIndex}
                    endpoint={endpoint}
                    endpointIndex={endpointIndex}
                    packagePath={packagePathIncludingSelf}
                />
            ))}
            {subPackages.map((package_, packageIndex) => (
                <PackageSidebarSection
                    key={packageIndex}
                    package={package_}
                    packagePathExcludingSelf={packagePathIncludingSelf}
                    indexInParent={packageIndex}
                />
            ))}
        </div>
    );
};
