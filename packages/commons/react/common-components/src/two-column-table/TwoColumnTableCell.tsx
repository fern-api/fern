import classNames from "classnames";
import React from "react";
import styles from "./TwoColumnTableCell.module.scss";

export declare namespace TwoColumnTableCell {
    export type Props = React.PropsWithChildren<{
        className?: string;
        verticalAlignCenter?: boolean;
    }>;
}

export const TwoColumnTableCell: React.FC<TwoColumnTableCell.Props> = ({
    className,
    verticalAlignCenter = false,
    children,
}) => {
    return (
        <div
            className={classNames(className, styles.cell, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.verticalAlignCenter!]: verticalAlignCenter,
            })}
        >
            {children}
        </div>
    );
};
