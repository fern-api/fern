import classNames from "classnames";
import React from "react";
import styles from "./TwoColumnTable.module.scss";

export declare namespace TwoColumnTable {
    export type Props = React.PropsWithChildren<{
        className?: string;
    }>;
}

export const TwoColumnTable: React.FC<TwoColumnTable.Props> = ({ className, children }) => {
    return <div className={classNames(className, styles.table)}>{children}</div>;
};
