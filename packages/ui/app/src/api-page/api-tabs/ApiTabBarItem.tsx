import { Text } from "@blueprintjs/core";
import { useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";
import React, { useCallback, useMemo } from "react";
import { RxCross1 } from "react-icons/rx";
import { Tab } from "./context/ApiTabsContext";
import { useApiTabsContext } from "./context/useApiTabsContext";
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

    if (tabTitle == null) {
        return null;
    }

    return (
        <TabBarItemWrapper className="flex min-w-[125px] max-w-[200px] bg-zinc-900">
            <div
                key={tab.path}
                className={classNames(
                    "relative flex flex-1 items-center justify-between px-3 select-none cursor-pointer min-w-0 gap-3",
                    {
                        italic: tab.isEphemeral,
                    }
                )}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                {...hoveringCallbacks}
            >
                <div
                    className={classNames(
                        "absolute top-0 left-0 right-0",
                        tab.isSelected ? "h-1 bg-green-500" : "h-px bg-gray-600"
                    )}
                />
                <Text ellipsize className="whitespace-nowrap">
                    {tabTitle}
                </Text>
                <div
                    className={classNames("text-slate-300 hover:text-white", {
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
