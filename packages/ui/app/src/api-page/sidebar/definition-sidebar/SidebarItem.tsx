import { IconName, Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarItem {
    export interface Props {
        title: JSX.Element | string;
        icon?: JSX.Element | IconName | ((args: { isSelected: boolean }) => JSX.Element | IconName);
        path: string;
    }
}

export const SidebarItem: React.FC<SidebarItem.Props> = ({ title, icon, path }) => {
    const isSelected = useLocation().pathname === path;

    const navigate = useNavigate();
    const onClick = useCallback(() => {
        navigate(path);
    }, [navigate, path]);

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <Text
                    className={classNames(
                        "pr-1",
                        isSelected ? "text-green-700" : isHovering ? "text-black" : "text-gray-500",
                        {
                            "font-bold": isSelected,
                        }
                    )}
                    ellipsize
                >
                    {title}
                </Text>
            );
        },
        [isSelected, title]
    );

    const renderIcon = useMemo(() => {
        if (typeof icon === "function") {
            return icon({ isSelected });
        } else {
            return icon;
        }
    }, [icon, isSelected]);

    return <SidebarItemLayout title={renderTitle} icon={renderIcon} onClick={onClick} />;
};
