import { Button, Icon, Text } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { useIsHovering } from "@fern-ui/react-commons";
import React from "react";
import styles from "./SidebarItem.module.scss";

export declare namespace SidebarItem {
    export interface Props {
        label: string;
        icon?: JSX.Element | IconName;
        onClickAdd?: () => void;
        onClickMore?: () => void;
        indent?: number;
        /**
         * if undefined, the collapse button is hidden
         */
        isCollapsed: boolean | undefined;
    }
}

export const SidebarItem: React.FC<SidebarItem.Props> = ({
    label,
    icon,
    indent,
    isCollapsed,
    onClickAdd,
    onClickMore,
}) => {
    const { isHovering, onMouseEnter, onMouseLeave } = useIsHovering();
    return (
        <div
            className={styles.container}
            style={{ paddingLeft: indent }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className={styles.left}>
                {isCollapsed != null && (
                    <Button small minimal icon={isCollapsed ? IconNames.CHEVRON_RIGHT : IconNames.CHEVRON_DOWN} />
                )}
                {icon != null && (typeof icon === "string" ? <Icon icon={icon} /> : icon)}
                <Text ellipsize>{label}</Text>
            </div>
            {isHovering && (
                <div className={styles.right}>
                    {onClickMore != null && <Button small minimal icon={IconNames.MORE} />}
                    {onClickAdd != null && <Button small minimal icon={IconNames.PLUS} onClick={onClickAdd} />}
                </div>
            )}
        </div>
    );
};
