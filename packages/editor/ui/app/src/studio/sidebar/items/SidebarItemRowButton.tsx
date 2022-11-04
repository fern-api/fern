import { Button, IconName } from "@blueprintjs/core";
import classNames from "classnames";
import React, { useCallback } from "react";
import styles from "./SidebarItemRowButton.module.scss";
import { markEventAsSelectionPreventing } from "./useSelectionPreventingEventHander";

export declare namespace SidebarItemRowButton {
    export interface Props {
        className?: string;
        icon: IconName;
        onClick?: () => void;
        hidden?: boolean;
    }
}

export const SidebarItemRowButton: React.FC<SidebarItemRowButton.Props> = ({
    className,
    icon,
    onClick,
    hidden = false,
}) => {
    const handleClick = useCallback(
        (event: React.MouseEvent) => {
            markEventAsSelectionPreventing(event);
            onClick?.();
        },
        [onClick]
    );

    return (
        <Button
            className={classNames(className, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.hidden!]: hidden,
            })}
            small
            minimal
            icon={icon}
            onMouseDown={markEventAsSelectionPreventing}
            onClick={handleClick}
        />
    );
};
