import { Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2, Popover2Props } from "@blueprintjs/popover2";
import classNames from "classnames";
import React from "react";
import { SidebarItemRowButton } from "./SidebarItemRowButton";
import styles from "./SidebarItemRowEllipsisPopover.module.scss";

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
                <SidebarItemRowButton
                    className={classNames({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        [styles.hidden!]: hidden,
                    })}
                    icon={IconNames.MORE}
                />
            </Popover2>
        </div>
    );
};
