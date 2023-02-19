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

    const { onMouseLeave, onMouseMove, onMouseOver, isHovering } = useIsHovering();

    return (
        <TabBarItemWrapper
            includeBottomBorder={!tab.isSelected}
            className={classNames({
                "bg-slate-300": !tab.isSelected,
            })}
        >
            <div
                key={tab.path}
                className={classNames("flex items-center pl-5 pr-1 select-none cursor-pointer", {
                    italic: tab.isEphemeral,
                })}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                onMouseLeave={onMouseLeave}
                onMouseMove={onMouseMove}
                onMouseOver={onMouseOver}
            >
                <div className="whitespace-nowrap">{tabTitle ?? "<Unknown tab>"}</div>

                <div
                    className={classNames("ml-3 p-1 rounded-md hover:bg-zinc-600/10", {
                        invisible: !isHovering,
                    })}
                    onClick={onClickCross}
                >
                    <RxCross1 />
                </div>
            </div>
        </TabBarItemWrapper>
    );
};
