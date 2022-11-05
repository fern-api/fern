import { Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2 } from "@blueprintjs/popover2";
import React from "react";
import { SidebarItemRowButton } from "../button/SidebarItemRowButton";
import { useSidebarItemRowContext } from "../context/SidebarItemRowContext";

export declare namespace EllipsisPopover {
    export interface Props {
        menu: JSX.Element;
        hidden: boolean;
    }
}

export const EllipsisPopover: React.FC<EllipsisPopover.Props> = ({ menu, hidden }) => {
    const { popoverProps } = useSidebarItemRowContext();
    return (
        <Popover2 {...popoverProps} content={menu} position={Position.BOTTOM_LEFT}>
            <SidebarItemRowButton hidden={hidden} icon={IconNames.MORE} />
        </Popover2>
    );
};
