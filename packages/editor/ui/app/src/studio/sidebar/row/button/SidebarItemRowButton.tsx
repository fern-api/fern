import { Button, IconName } from "@blueprintjs/core";
import { useBooleanState } from "@fern-ui/react-commons";
import classNames from "classnames";
import React, { useCallback } from "react";
import { markEventAsSelectionPreventing } from "../utils/markEventAsSelectionPreventing";
import styles from "./SidebarItemRowButton.module.scss";

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

    const { value: isFocused, setTrue: onFocus, setFalse: onBlur } = useBooleanState(false);

    return (
        <Button
            className={classNames(className, styles.button, {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [styles.hidden!]: hidden && !isFocused,
            })}
            small
            minimal
            icon={icon}
            onMouseDown={markEventAsSelectionPreventing}
            onClick={handleClick}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};
