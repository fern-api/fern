import { Classes, Text } from "@blueprintjs/core";
import { useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";
import React, { useCallback, useMemo } from "react";
import { RxCross1 } from "react-icons/rx";
import { Tab } from "./context/ApiTabsContext";
import { useApiTabsContext } from "./context/useApiTabsContext";
import { TabBarBottomLine } from "./TabBarBottomLine";
import { TabBarItemWrapper } from "./TabBarItemWrapper";
import { usePathTitle } from "./usePathTitle";

export declare namespace ApiTabBarItem {
    export interface Props {
        tab: Tab;
    }
}

export const ApiTabBarItem: React.FC<ApiTabBarItem.Props> = ({ tab }) => {
    const { openTab, closeTab, makeTabLongLived } = useApiTabsContext();
    const tabTitle = usePathTitle(tab.path);

    const onClick = useMemo(
        () => (tab.isSelected ? undefined : () => openTab(tab.path)),
        [openTab, tab.isSelected, tab.path]
    );

    const onDoubleClick = useMemo(
        () => (tab.isEphemeral ? () => makeTabLongLived(tab.path) : undefined),
        [makeTabLongLived, tab.isEphemeral, tab.path]
    );

    const onClickCross = useCallback(
        (event: React.MouseEvent) => {
            closeTab(tab.path);
            // so we don't trigger the "open tab" callback
            event.stopPropagation();
        },
        [closeTab, tab.path]
    );

    const { isHovering, ...hoveringCallbacks } = useIsHovering();

    return (
        <TabBarItemWrapper className="min-w-[125px] max-w-[200px] border-r border-gray-300">
            {tab.isSelected ? <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" /> : <TabBarBottomLine />}
            <div
                key={tab.path}
                className={classNames(
                    "flex flex-1 items-center justify-between px-3 select-none cursor-pointer min-w-0 gap-3 pt-1",
                    {
                        italic: tab.isEphemeral,
                        "bg-gray-200": !tab.isSelected,
                    }
                )}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                {...hoveringCallbacks}
            >
                <Text
                    ellipsize
                    className={classNames("whitespace-nowrap", {
                        [Classes.SKELETON]: tabTitle.type !== "loaded",
                    })}
                >
                    {tabTitle.type === "loaded"
                        ? tabTitle.value ?? <div className="text-gray-300">Unknown</div>
                        : "SKELETON_TEXT"}
                </Text>
                <div
                    className={classNames("text-gray-400 hover:text-black", {
                        invisible: !tab.isSelected && !isHovering,
                    })}
                    onClick={onClickCross}
                >
                    <RxCross1 />
                </div>
            </div>
        </TabBarItemWrapper>
    );
};
