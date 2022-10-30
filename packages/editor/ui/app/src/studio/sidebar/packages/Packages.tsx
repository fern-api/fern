import { isLoaded } from "@fern-api/loadable";
import React from "react";
import { useLightweightAPI } from "../../queries/useLightweightApi";
import styles from "./Packages.module.scss";
import { PackageSidebarGroup } from "./PackageSidebarGroup";

export const Packages: React.FC = () => {
    const lightweightApi = useLightweightAPI();
    if (!isLoaded(lightweightApi)) {
        return null;
    }
    return (
        <div className={styles.packages}>
            {lightweightApi.value.packages.map((lightweightPackage) => (
                <PackageSidebarGroup key={lightweightPackage.packageId} lightweightPackage={lightweightPackage} />
            ))}
        </div>
    );
};
