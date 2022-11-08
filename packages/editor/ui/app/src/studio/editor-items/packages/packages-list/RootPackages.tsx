import React from "react";
import { useApiEditorContext } from "../../../../api-editor-context/ApiEditorContext";
import { PackagesList } from "./PackagesList";
import styles from "./RootPackages.module.scss";

export const Packages: React.FC = () => {
    const { definition } = useApiEditorContext();
    return (
        <div className={styles.packages}>
            <PackagesList packages={definition.rootPackages} parent={undefined} />
        </div>
    );
};
