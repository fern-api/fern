import React from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import styles from "./Packages.module.scss";
import { PackageSidebarGroup } from "./PackageSidebarGroup";

export const Packages: React.FC = () => {
    const { definition } = useApiEditorContext();
    return (
        <div className={styles.packages}>
            {definition.rootPackages.map((packageId) => (
                <PackageSidebarGroup key={packageId} packageId={packageId} />
            ))}
        </div>
    );
};
