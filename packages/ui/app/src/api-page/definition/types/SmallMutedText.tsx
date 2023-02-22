import { PropsWithChildren } from "react";
import styles from "./SmallMutedText.module.scss";

export const SmallMutedText: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className={styles.container}>{children}</div>;
};
