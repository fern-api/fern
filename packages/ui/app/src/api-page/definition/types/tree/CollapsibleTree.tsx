import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import classNames from "classnames";
import { PropsWithChildren } from "react";
import { SmallMutedText } from "../SmallMutedText";
import styles from "./CollapsibleTree.module.scss";

export declare namespace CollapsibleTree {
    export type Props = PropsWithChildren<{
        title: JSX.Element | string;
        defaultIsCollapsed: boolean;
    }>;
}

export const CollapsibleTree: React.FC<CollapsibleTree.Props> = ({ title, defaultIsCollapsed, children }) => {
    const { value: isCollapsed, toggleValue: toggleIsCollapsed } = useBooleanState(defaultIsCollapsed);

    return (
        <div className={styles.container}>
            <div className={classNames(styles.caret, styles.clickable)} onClick={toggleIsCollapsed}>
                <Icon
                    className={styles.collapseIcon}
                    icon={isCollapsed ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_DOWN}
                    size={12}
                />
            </div>
            <div className={classNames(styles.title, styles.clickable)} onClick={toggleIsCollapsed}>
                <SmallMutedText>{title}</SmallMutedText>
            </div>
            {!isCollapsed && (
                <>
                    <div className={styles.leftLine}>
                        <div className={styles.leftLineInner}></div>
                    </div>
                    <div className={styles.details}>{children}</div>
                </>
            )}
        </div>
    );
};
