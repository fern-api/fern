import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import { PropsWithChildren } from "react";
import styles from "./CollapsibleSidebarSection.module.scss";

export declare namespace CollapsibleSidebarSection {
    export type Props = PropsWithChildren<{
        title: string;
    }>;
}

export const CollapsibleSidebarSection: React.FC<CollapsibleSidebarSection.Props> = ({ title, children }) => {
    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(true);

    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper} onClick={toggleIsCollapsed}>
                <Icon icon={isCollapsed ? IconNames.CARET_RIGHT : IconNames.CARET_DOWN} />
            </div>
            <div>{title}</div>
            <div className={styles.leftLineWrapper}>
                <div className={styles.leftLine} />
            </div>
            {isCollapsed || children}
        </div>
    );
};
