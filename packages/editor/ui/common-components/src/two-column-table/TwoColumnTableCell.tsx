import classNames from "classnames";
import React from "react";
import styles from "./TwoColumnTableCell.module.scss";

export declare namespace TwoColumnTableCell {
    export type Props = React.PropsWithChildren<{
        className?: string;
    }>;
}

export const TwoColumnTableCell: React.FC<TwoColumnTableCell.Props> = ({ className, children }) => {
    return <div className={classNames(styles.cell, className)}>{children}</div>;
};
