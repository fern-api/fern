import { MenuItem, MenuItemProps } from "@blueprintjs/core";
import React, { useCallback } from "react";
import { markEventAsSelectionPreventing } from "../utils/markEventAsSelectionPreventing";

export const SidebarItemMenuItem: React.FC<MenuItemProps> = (props) => {
    const onClick = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            markEventAsSelectionPreventing(event);
            props.onClick?.(event);
        },
        [props]
    );

    return <MenuItem {...props} onClick={onClick} />;
};
