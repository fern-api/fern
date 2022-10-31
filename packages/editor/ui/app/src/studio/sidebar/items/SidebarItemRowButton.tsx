import { Button, IconName } from "@blueprintjs/core";
import React, { useCallback } from "react";

export const SIDEBAR_ITEM_ROW_BUTTON_PROPERTY = "__sidebarItemRowButton";

export declare namespace SidebarItemRowButton {
    export interface Props {
        className?: string;
        icon: IconName;
        onClick?: () => void;
    }
}

export const SidebarItemRowButton: React.FC<SidebarItemRowButton.Props> = ({ className, icon, onClick }) => {
    const handleClick = useCallback(
        (event: React.MouseEvent) => {
            onClick?.();
            // so we don't select the row
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (event as any)[SIDEBAR_ITEM_ROW_BUTTON_PROPERTY] = true;
        },
        [onClick]
    );

    const onMouseDown = useCallback((event: React.MouseEvent) => {
        // so we don't style the row as "active" (active mouse press)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (event as any)[SIDEBAR_ITEM_ROW_BUTTON_PROPERTY] = true;
    }, []);

    return <Button className={className} small minimal icon={icon} onMouseDown={onMouseDown} onClick={handleClick} />;
};
