import { Button, IconName } from "@blueprintjs/core";
import React, { useCallback } from "react";
import { markEventAsSelectionPreventing } from "./useSelectionPreventingEventHander";

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
            markEventAsSelectionPreventing(event);
            onClick?.();
        },
        [onClick]
    );

    return (
        <Button
            className={className}
            small
            minimal
            icon={icon}
            onMouseDown={markEventAsSelectionPreventing}
            onClick={handleClick}
        />
    );
};
