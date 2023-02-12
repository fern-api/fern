import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { PackageId, PackagePath } from "../context/ApiContext";
import styles from "./PackageDefinition.module.scss";
import { PackageDefinitionContents } from "./PackageDefinitionContents";
import { PackageLabel } from "./PackageLabel";

export declare namespace PackageDefinition {
    export interface Props {
        package: FernRegistry.ApiDefinitionSubpackage;
        packagePathExcludingSelf: PackagePath;
        indexInParent: number;
    }
}

export const PackageDefinition: React.FC<PackageDefinition.Props> = ({
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

    return (
        <div className={styles.container}>
            <PackageLabel package={package_} packageId={packageId} />
            <PackageDefinitionContents
                packagePathIncludingSelf={packagePathIncludingSelf}
                subPackages={package_.packages}
                endpoints={package_.endpoints}
            />
        </div>
    );
};
