import classNames from "classnames";
import { TwoColumnTableCell } from "./TwoColumnTableCell";
import styles from "./TwoColumnTableRow.module.scss";

export declare namespace TwoColumnTableRow {
    export type Props = React.PropsWithChildren<{
        verticallyCenterLabel?: boolean;
        labelClassName?: string;
        label: string;
    }>;
}

export const TwoColumnTableRow: React.FC<TwoColumnTableRow.Props> = ({
    label,
    labelClassName,
    verticallyCenterLabel = false,
    children,
}) => {
    return (
        <>
            <TwoColumnTableCell
                className={classNames(labelClassName, styles.label)}
                verticalAlignCenter={verticallyCenterLabel}
            >
                {label}
            </TwoColumnTableCell>
            <TwoColumnTableCell>{children}</TwoColumnTableCell>
        </>
    );
};
