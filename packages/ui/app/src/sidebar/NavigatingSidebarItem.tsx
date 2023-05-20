import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarItemLayout } from "./SidebarItemLayout";
import { useIsPathnameSelected } from "./useIsPathnameSelected";

export declare namespace NavigatingSidebarItem {
    export interface Props {
        title: JSX.Element | string;
        path: string;
        onClick?: () => void;
    }
}

export const NavigatingSidebarItem: React.FC<NavigatingSidebarItem.Props> = ({ title, path, onClick }) => {
    const navigate = useNavigate();
    const handleClick = useCallback(() => {
        navigate(path);
        onClick?.();
    }, [navigate, onClick, path]);

    const isSelected = useIsPathnameSelected(path);

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
            onClick={handleClick}
        />
    );
};
