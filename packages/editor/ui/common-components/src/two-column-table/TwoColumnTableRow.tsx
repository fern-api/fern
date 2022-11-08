import { TwoColumnTableCell } from "./TwoColumnTableCell";
import styles from "./TwoColumnTableRow.module.scss";

export declare namespace TwoColumnTableRow {
    export type Props = React.PropsWithChildren<{
        label: string;
    }>;
}

export const TwoColumnTableRow: React.FC<TwoColumnTableRow.Props> = ({ label, children }) => {
    return (
        <>
            <TwoColumnTableCell className={styles.label}>{label}</TwoColumnTableCell>
            <TwoColumnTableCell>{children}</TwoColumnTableCell>
        </>
    );
};
