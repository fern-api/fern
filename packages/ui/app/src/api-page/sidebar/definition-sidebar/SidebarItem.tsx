import { Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback } from "react";
import { useApiTab } from "../../api-tabs/context/useApiTab";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarItem {
    export interface Props {
        title: JSX.Element | string;
        icon?: JSX.Element | string;
        path: string;
    }
}

export const SidebarItem: React.FC<SidebarItem.Props> = ({ title, icon, path }) => {
    const { openTab, isSelected, makeTabLongLived } = useApiTab(path);

    const onClick = useCallback(() => {
        openTab();
    }, [openTab]);

    const renderTitle = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            return (
                <Text
                    className={classNames("pr-1", {
                        "text-green-700": isSelected || isHovering,
                    })}
                    ellipsize
                >
                    {title}
                </Text>
            );
        },
        [isSelected, title]
    );

    const getOverlayClassName = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            if (isHovering) {
                return "bg-green-500/[0.25]";
            }
            if (isSelected) {
                return "bg-green-500/[0.15]";
            }
            return undefined;
        },
        [isSelected]
    );

    return (
        <SidebarItemLayout
            title={renderTitle}
            icon={icon}
            onClick={onClick}
            onDoubleClick={makeTabLongLived}
            overlayClassName={getOverlayClassName}
        />
    );
};
