import { Button, Icon, Intent, Menu, MenuItem, Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import React from "react";

export const AddSidebarItemButton: React.FC = () => {
    return (
        <Popover2
            content={
                <Menu>
                    <MenuItem
                        text="Resource"
                        icon={IconNames.CUBE}
                        labelElement={
                            <Tooltip2
                                content={
                                    <>
                                        A type that has <strong>operations</strong>, e.g. "create" and "delete"
                                    </>
                                }
                            >
                                <Icon icon={IconNames.HELP} />
                            </Tooltip2>
                        }
                    />
                    <MenuItem text="Type" icon={IconNames.ARRAY} />
                    <MenuItem text="Folder" icon={IconNames.FOLDER_CLOSE} />
                </Menu>
            }
            position={Position.BOTTOM_LEFT}
        >
            <Button icon={IconNames.CHEVRON_DOWN} intent={Intent.SUCCESS} />
        </Popover2>
    );
};
