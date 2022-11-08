import React from "react";
import styles from "./TwoColumnTable.module.scss";

export const TwoColumnTable: React.FC<React.PropsWithChildren> = ({ children }) => {
    return <div className={styles.table}>{children}</div>;
};
