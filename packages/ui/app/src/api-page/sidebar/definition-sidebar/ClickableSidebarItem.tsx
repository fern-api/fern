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
                <>
                    <Text
                        className={classNames("select-none", {
                            "text-[#B1BCF1]": isSelected,
                            "text-black dark:text-gray-400": !isSelected && isHovering,
                        })}
                        ellipsize
                    >
                        {title}
                    </Text>
                    {isSelected && <div className="w-1 bg-[#979de8] absolute top-0 right-0 bottom-0" />}
                </>
            );
        },
        [isSelected, title]
    );

    return (
        <SidebarItemLayout
            className={classNames({
                "bg-[#4435D0]/20 relative": isSelected,
            })}
            title={renderTitle}
            onClick={isSelected ? undefined : onClick}
        />
    );
};
