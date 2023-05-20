import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDocsContext } from "../docs-context/useDocsContext";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace ClickableSidebarItem {
    export interface Props {
        title: JSX.Element | string;
        path: string;
        onClick?: () => void;
    }
}

export const ClickableSidebarItem: React.FC<ClickableSidebarItem.Props> = ({ title, path, onClick }) => {
    const { onClickSidebarItem } = useDocsContext();

    const navigate = useNavigate();
    const handleClick = useCallback(() => {
        navigate(path);
        onClickSidebarItem(`/${path}`);
        onClick?.();
    }, [navigate, onClick, onClickSidebarItem, path]);

    const location = useLocation();
    // remove leading / from location.pathname
    const currentPath = location.pathname.substring(1) + location.hash;
    const isSelected = path === currentPath;

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
            onClick={isSelected ? undefined : handleClick}
        />
    );
};
