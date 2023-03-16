import { IconName, Text } from "@blueprintjs/core";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useApiTab } from "../../api-tabs/context/useApiTab";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace SidebarItem {
    export interface Props {
        title: JSX.Element | string;
        icon?: JSX.Element | IconName | ((args: { isSelected: boolean }) => JSX.Element | IconName);
        path: string;
    }
}

export const SidebarItem: React.FC<SidebarItem.Props> = ({ title, icon, path }) => {
    const { openTab, isSelected, makeTabLongLived } = useApiTab(path);

    const onClick = useCallback(() => {
        openTab();
    }, [openTab]);

    const getOverlayClassName = useCallback(
        ({ isHovering }: { isHovering: boolean }) => {
            if (isSelected) {
                return isHovering ? "bg-green-500/[0.25]" : "bg-green-500/[0.15]";
            }
            if (isHovering) {
                return "bg-neutral-400/20";
            }
            return undefined;
        },
        [isSelected]
    );

    const renderIcon = useMemo(() => {
        if (typeof icon === "function") {
            return icon({ isSelected });
        } else {
            return icon;
        }
    }, [icon, isSelected]);

    return (
        <SidebarItemLayout
            title={
                <Text
                    className={classNames("pr-1", {
                        "text-green-700": isSelected,
                    })}
                    ellipsize
                >
                    {title}
                </Text>
            }
            icon={renderIcon}
            onClick={onClick}
            onDoubleClick={makeTabLongLived}
            overlayClassName={getOverlayClassName}
        />
    );
};
