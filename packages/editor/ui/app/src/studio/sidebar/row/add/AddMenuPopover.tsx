import { Menu, MenuItemProps, Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2 } from "@blueprintjs/popover2";
import { SidebarItemRowButton } from "../button/SidebarItemRowButton";
import { useSidebarItemRowContext } from "../context/SidebarItemRowContext";
import { SidebarItemMenuItem } from "../menu-item/SidebarItemMenuItem";

export declare namespace AddMenuPopover {
    export interface Props {
        items: MenuItemProps[];
        hidden: boolean;
    }
}

export const AddMenuPopover: React.FC<AddMenuPopover.Props> = ({ items, hidden }) => {
    const { popoverProps } = useSidebarItemRowContext();

    return (
        <Popover2
            {...popoverProps}
            position={Position.BOTTOM_LEFT}
            content={
                <Menu>
                    {items.map((menuItemProps, index) => (
                        <SidebarItemMenuItem key={index} {...menuItemProps} />
                    ))}
                </Menu>
            }
        >
            <SidebarItemRowButton icon={IconNames.PLUS} hidden={hidden} />
        </Popover2>
    );
};
