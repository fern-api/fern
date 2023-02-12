import { FernRegistry } from "@fern-fern/registry";
import { PackagePath } from "../context/ApiContext";
import { Endpoint } from "./endpoints/Endpoint";
import { PackageDefinition } from "./PackageDefinition";
import styles from "./PackageDefinitionContents.module.scss";

export declare namespace PackageDefinitionContents {
    export interface Props {
        packagePathIncludingSelf: PackagePath;
        subPackages: FernRegistry.ApiDefinitionSubpackage[];
        endpoints: FernRegistry.EndpointDefinition[];
    }
}

export const PackageDefinitionContents: React.FC<PackageDefinitionContents.Props> = ({
    subPackages,
    endpoints,
    packagePathIncludingSelf,
}) => {
    return (
        <div className={styles.container}>
            {endpoints.map((endpoint, endpointIndex) => (
                <div key={endpointIndex} className={styles.endpointContainer}>
                    <div className={styles.divider} />
                    <div className={styles.endpoint}>
                        <Endpoint
                            endpoint={endpoint}
                            packagePath={packagePathIncludingSelf}
                            indexInParent={endpointIndex}
                        />
                    </div>
                </div>
            ))}
            {subPackages.map((subPackage, subPackageIndex) => (
                <PackageDefinition
                    key={subPackageIndex}
                    package={subPackage}
                    packagePathExcludingSelf={packagePathIncludingSelf}
                    indexInParent={subPackageIndex}
                />
            ))}
        </div>
    );
};
