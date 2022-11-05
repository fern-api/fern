import { Text } from "@blueprintjs/core";
import styles from "./SidebarItemLabel.module.scss";

export declare namespace SidebarItemLabel {
    export interface Props {
        label: string;
    }
}

export const SidebarItemLabel: React.FC<SidebarItemLabel.Props> = ({ label }) => {
    return (
        <Text className={styles.label} ellipsize>
            {label}
        </Text>
    );
};
