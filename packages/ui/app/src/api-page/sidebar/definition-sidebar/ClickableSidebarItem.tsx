import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace ClickableSidebarItem {
    export interface Props {
        title: JSX.Element | string;
        path: string;
        isSelected: boolean;
    }
}

export const ClickableSidebarItem: React.FC<ClickableSidebarItem.Props> = ({ title, path, isSelected }) => {
    const navigate = useNavigate();
    const onClick = useCallback(() => {
        navigate(path);
    }, [navigate, path]);

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <Text
                    className={classNames(
                        "flex flex-1 items-center pr-1",
                        isSelected ? "text-green-500" : isHovering ? "text-black dark:text-gray-400" : "text-gray-500",
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

    return <SidebarItemLayout title={renderTitle} onClick={onClick} />;
};
