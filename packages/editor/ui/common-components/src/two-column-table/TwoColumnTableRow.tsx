import { Icon } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import classNames from "classnames";
import { TwoColumnTableCell } from "./TwoColumnTableCell";
import styles from "./TwoColumnTableRow.module.scss";

export declare namespace TwoColumnTableRow {
    export type Props = React.PropsWithChildren<{
        verticallyCenterLabel?: boolean;
        labelClassName?: string;
        icon?: IconName | JSX.Element;
        label: string;
    }>;
}

export const TwoColumnTableRow: React.FC<TwoColumnTableRow.Props> = ({
    icon,
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
                {icon != null && (
                    <div className={styles.icon}>{typeof icon === "string" ? <Icon icon={icon} /> : icon}</div>
                )}
                {label}
            </TwoColumnTableCell>
            <TwoColumnTableCell>{children}</TwoColumnTableCell>
        </>
    );
};
