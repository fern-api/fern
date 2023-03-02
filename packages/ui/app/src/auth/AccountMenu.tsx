import { User } from "@auth0/auth0-react";
import { Icon, Menu, MenuItem, Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2 } from "@blueprintjs/popover2";
import { useLogOut } from "./useLogOut";

export declare namespace AccountMenu {
    export interface Props {
        user: User;
        hideProfilePicture?: boolean;
    }
}

export const AccountMenu: React.FC<AccountMenu.Props> = ({ user, hideProfilePicture = false }) => {
    const logOut = useLogOut();

    return (
        <div>
            <Popover2
                content={
                    <Menu>
                        <MenuItem text="Log out" icon={IconNames.LOG_OUT} onClick={logOut} />
                    </Menu>
                }
                renderTarget={({ isOpen, ...props }) => (
                    <div {...props} className="flex gap-2 items-center cursor-pointer">
                        {!hideProfilePicture && user.picture != null && (
                            <div
                                className="w-7 h-7 rounded-full bg-contain"
                                style={{
                                    backgroundImage: `url("${user.picture}")`,
                                }}
                            />
                        )}
                        {user.nickname ?? user.name ?? user.email ?? "Your account"}
                        <Icon icon={IconNames.CARET_DOWN} />
                    </div>
                )}
                position={Position.BOTTOM_RIGHT}
            />
        </div>
    );
};
