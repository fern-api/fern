import React from "react";
import { useApiEditorContext } from "../../../api-editor-context/ApiEditorContext";
import styles from "./Packages.module.scss";
import { PackagesList } from "./PackagesList";

export const Packages: React.FC = () => {
    const { definition } = useApiEditorContext();
    return (
        <div className={styles.packages}>
            <PackagesList packages={definition.rootPackages} parent={undefined} />
        </div>
    );
};
