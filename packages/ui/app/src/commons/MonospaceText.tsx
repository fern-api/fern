import React, { PropsWithChildren } from "react";
import styles from "./MonospaceText.module.scss";

export const MonospaceText: React.FC<PropsWithChildren> = ({ children }) => {
    return <span className={styles.container}>{children}</span>;
};
