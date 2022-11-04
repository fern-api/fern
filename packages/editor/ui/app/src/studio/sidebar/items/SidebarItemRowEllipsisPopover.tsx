import { Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2, Popover2Props } from "@blueprintjs/popover2";
import React from "react";
import { SidebarItemRowButton } from "./SidebarItemRowButton";

export declare namespace SidebarItemRowEllipsisPopover {
    export interface Props {
        menu: JSX.Element;
        popoverProps?: Popover2Props;
        hidden: boolean;
    }
}

export const SidebarItemRowEllipsisPopover: React.FC<SidebarItemRowEllipsisPopover.Props> = ({
    menu,
    popoverProps,
    hidden,
}) => {
    return (
        <div>
            <Popover2 {...popoverProps} content={menu} position={Position.BOTTOM_LEFT}>
                <SidebarItemRowButton hidden={hidden} icon={IconNames.MORE} />
            </Popover2>
        </div>
    );
};
